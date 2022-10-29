package main

import (
	"encoding/json"
	"fmt"
	"image/png"
	"io/ioutil"
	"log"
	"math"
	"os"
	"strconv"
	"strings"
)

var SRC_MAPS_DIR = "./maps"
var OUT_MAPS_DIR = "./src/maps"
var FILE_FORMAT = ".png"

func main() {
	files, err := ioutil.ReadDir(SRC_MAPS_DIR)

	if err != nil {
		log.Fatal(err)
	}

	routines := 0

	c := make(chan struct{})
	for _, file := range files {
		filename := file.Name()
		if file.IsDir() || !strings.HasSuffix(strings.ToLower(filename), FILE_FORMAT) {
			fmt.Println("Skipping file:", filename)
			continue
		}

		fmt.Println("Processing file:", filename)
		routines++
		go func() {
			processFile(filename)
			c <- struct{}{}
		}()
	}

	for i := 0; i < routines; i++ {
		<-c
	}
}

type TileSegment [4]int
type TilePoint [2]int
type TileSet []TilePoint

type TileHash = map[string]bool

type GameMap struct {
	WallTiles        TileSet       `json:"wallTiles"`
	SpawnTiles       TileSet       `json:"spawnTiles"`
	WallSegments     []TileSegment `json:"wallSegments"`
	WallSegmentTiles TileSet       `json:"wallSegmentTiles"`
}

func translateTileSet(t TileSet, x int, y int) TileSet {
	output := TileSet{}

	for i := 0; i < len(t); i++ {
		transposed := TilePoint{t[i][0] + x, t[i][1] + y}
		output = append(output, transposed)
	}

	return output
}

func tileExists(t TileSet, x int, y int) bool {
	for i := 0; i < len(t); i++ {
		_x := t[i][0]
		_y := t[i][1]
		if x == _x && y == _y {
			return true
		}
	}

	return false
}

func createTileKey(x int, y int) string {
	return strconv.Itoa(x) + "-" + strconv.Itoa(y)
}

func createTileHash(t TileSet) TileHash {
	hash := make(TileHash)

	for i := 0; i < len(t); i++ {
		_x, _y := t[i][0], t[i][1]
		key := createTileKey(_x, _y)
		hash[key] = true
	}

	return hash
}

func tileExistsInHash(t TileHash, x int, y int) bool {
	key := createTileKey(x, y)
	_, ok := t[key]
	return ok
}

var n = 2

type TileMatrix [9]int

func tileCountCorners(t TileHash, centerX int, centerY int) int {
	sum := 0
	if tileExistsInHash(t, centerX-1, centerY-1) {
		sum = sum + 1
	}
	if tileExistsInHash(t, centerX-1, centerY+1) {
		sum = sum + 1
	}
	if tileExistsInHash(t, centerX+1, centerY-1) {
		sum = sum + 1
	}
	if tileExistsInHash(t, centerX+1, centerY+1) {
		sum = sum + 1
	}
	return sum
}

func tileCountSides(t TileHash, centerX int, centerY int) int {
	sum := 0
	if tileExistsInHash(t, centerX-1, centerY) {
		sum = sum + 1
	}
	if tileExistsInHash(t, centerX+1, centerY) {
		sum = sum + 1
	}
	if tileExistsInHash(t, centerX, centerY+1) {
		sum = sum + 1
	}
	if tileExistsInHash(t, centerX, centerY-1) {
		sum = sum + 1
	}
	return sum
}

func getTileSetBounds(t TileSet) (int, int, int, int) {
	minX := math.MaxInt16
	maxX := -math.MaxInt16
	minY := math.MaxInt16
	maxY := -math.MaxInt16

	for i := 0; i < len(t); i++ {
		x := t[i][0]
		y := t[i][1]

		switch true {
		case x < minX:
			minX = x
		case x > maxX:
			maxX = x
		}

		switch true {
		case y < minY:
			minY = y
		case y > maxY:
			maxY = y
		}
	}

	return minX, maxX, minY, maxY
}

func (gm *GameMap) Translate(x int, y int) {
	gm.WallTiles = translateTileSet(gm.WallTiles, x, y)
	gm.SpawnTiles = translateTileSet(gm.SpawnTiles, x, y)
}

func (gm *GameMap) Center() {
	pool := TileSet{}
	pool = append(pool, gm.WallTiles...)
	pool = append(pool, gm.SpawnTiles...)

	minX, maxX, minY, maxY := getTileSetBounds(pool)

	centerX := (maxX + minX) / 2
	centerY := (maxY + minY) / 2

	gm.Translate(-centerX, -centerY)
}

func (gm *GameMap) GenerateSegments() {
	segments := []TileSegment{}

	pool := TileSet{}

	basePool := TileSet{}
	basePool = append(basePool, gm.WallTiles...)

	basePoolHash := createTileHash(basePool)

	for i := 0; i < len(basePool); i++ {
		tile := basePool[i]
		if (tileCountCorners(basePoolHash, tile[0], tile[1]) + tileCountSides(basePoolHash, tile[0], tile[1])) < 8 {
			pool = append(pool, tile)
		}
	}

	minX, maxX, minY, maxY := getTileSetBounds(pool)

	getCon := func(x int, y int, offsetX int, offsetY int) (bool, bool) {
		corners := tileCountCorners(basePoolHash, x, y) <= 3
		sides := tileCountSides(basePoolHash, x, y) <= 3
		con := tileExistsInHash(basePoolHash, x, y) && (corners || sides)
		start := con && tileExistsInHash(basePoolHash, x+offsetX, y+offsetY)
		return con, start
	}

	// horizontal
	for y := minY - 1; y <= maxY+1; y++ {
		tracking, startX, startY := false, 0, 0
		for x := minX - 1; x <= maxX+1; x++ {
			con, start := getCon(x, y, 1, 0)
			if tracking {
				if con {
					// continue
				} else {
					segments = append(segments, TileSegment{startX, startY, x - 1, y})
					tracking = false
				}
			} else {
				if start {
					tracking, startX, startY = true, x, y
				}
			}
		}
	}

	// vertical
	for x := minX - 1; x <= maxX+1; x++ {
		tracking, startX, startY := false, 0, 0
		for y := minY - 1; y <= maxY+1; y++ {
			con, start := getCon(x, y, 0, 1)
			if tracking {
				if con {
					// continue
				} else {
					segments = append(segments, TileSegment{startX, startY, x, y - 1})
					tracking = false
				}
			} else {
				if start {
					tracking, startX, startY = true, x, y
				}
			}
		}
	}

	// lone tiles
	for i := 0; i < len(pool); i++ {
		tile := pool[i]
		if (tileCountSides(basePoolHash, tile[0], tile[1]) + tileCountCorners(basePoolHash, tile[0], tile[1])) <= 2 {
			segments = append(segments, TileSegment{tile[0], tile[1], tile[0], tile[1]})
		}
	}

	gm.WallSegmentTiles = pool
	gm.WallSegments = segments
}

func whyTheFuckDoesGoNotHaveSplice(slice [][]TilePoint, index int) [][]TilePoint {
	if index < 0 {
		return slice
	}
	if index > len(slice) {
		return slice
	}
	if index == 0 {
		return slice[1:]
	}
	if index == len(slice)-1 {
		return slice[:index]
	}
	return append(slice[:index], slice[index+1:]...)
}

func processFile(filename string) {
	fmt.Println("Starting processing...")
	inputPath := SRC_MAPS_DIR + "/" + filename
	outputPath := OUT_MAPS_DIR + "/" + strings.Replace(filename, FILE_FORMAT, ".map.json", -1)

	file, _ := os.Open(inputPath)
	img, err := png.Decode(file)

	if err != nil {
		log.Fatal(err)
	}

	gameMap := GameMap{}

	for y := 0; y < img.Bounds().Max.Y; y++ {
		for x := 0; x < img.Bounds().Max.X; x++ {
			color := img.At(x, y)
			_r, _g, _b, _a := color.RGBA()
			r, g, b, a := uint8(_r), uint8(_g), uint8(_b), uint8(_a)

			// wall
			if r == 0 && g == 0 && b == 0 && a == 255 {
				gameMap.WallTiles = append(gameMap.WallTiles, TilePoint{x, y})
			}

			// spawn
			if r == 255 && g == 0 && b == 0 && a == 255 {
				gameMap.SpawnTiles = append(gameMap.SpawnTiles, TilePoint{x, y})
			}
		}
	}

	gameMap.Center()
	gameMap.GenerateSegments()

	jsonMarshal, jsonErr := json.Marshal(gameMap)

	if jsonErr != nil {
		log.Fatal(jsonErr)
	}

	writeError := ioutil.WriteFile(outputPath, jsonMarshal, 0644)

	if writeError != nil {
		log.Fatal(writeError)
	}

}
