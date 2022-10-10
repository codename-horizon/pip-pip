package main

import (
	"encoding/json"
	"fmt"
	"image/png"
	"io/ioutil"
	"log"
	"math"
	"os"
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

	for _, file := range files {
		filename := file.Name()
		if file.IsDir() || !strings.HasSuffix(strings.ToLower(filename), FILE_FORMAT) {
			fmt.Println("Skipping file:", filename)
			continue
		}

		fmt.Println("Processing file:", filename)
		processFile(filename)
	}

}

type TileSegment [4]int
type TilePoint [2]int
type TileSet []TilePoint

type GameMap struct {
	WallTiles    TileSet       `json:"wallTiles"`
	SpawnTiles   TileSet       `json:"spawnTiles"`
	WallSegments []TileSegment `json:"wallSegments"`
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

var n = 2

type TileMatrix [9]int

func tilePatternExists(t TileSet, centerX int, centerY int, pattern TileMatrix) bool {
	for y := 0; y < 3; y++ {
		for x := 0; x < 3; x++ {
			i := y*3 + x
			condition := pattern[i]
			exists := tileExists(t, centerX+x-1, centerY+y-1)
			if (condition == 0 && exists) || condition == 1 && !exists {
				return false
			}
		}
	}
	return true
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

func (gm *GameMap) GenerateWalls() {
	walls := []TileSegment{}
	pool := gm.WallTiles
	minX, maxX, minY, maxY := getTileSetBounds(pool)
	width, height := maxX-minX, maxY-minY
	maxDim := int(math.Max(float64(width), float64(height)))

	// get left to right
	for y := minY; y <= maxY; y++ {
		tracking := false
		start := TilePoint{0, 0}
		for x := minX; x <= maxX; x++ {
			if tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				n, 1, 0,
				n, n, n,
			}) {
				tracking = false
				walls = append(walls, TileSegment{start[0], start[1], x, y})
			} else if !tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				n, 1, 1,
				n, n, n,
			}) {
				tracking = true
				start = TilePoint{x, y}
			}
		}
	}

	// get top to bottom
	for x := minX; x <= maxX; x++ {
		tracking := false
		start := TilePoint{0, 0}
		for y := minY; y <= maxY; y++ {
			if tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				n, 1, n,
				n, 0, n,
			}) {
				tracking = false
				walls = append(walls, TileSegment{start[0], start[1], x, y})
			} else if !tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				n, 1, n,
				n, 1, n,
			}) {
				tracking = true
				start = TilePoint{x, y}
			}
		}
	}

	// get lone tiles
	for x := minX; x <= maxX; x++ {
		for y := minY; y <= maxY; y++ {
			if tilePatternExists(pool, x, y, TileMatrix{
				0, 0, 0,
				0, 1, 0,
				0, 0, 0,
			}) {
				walls = append(walls, TileSegment{x, y, x, y})
			}
		}
	}

	// get top left to bottom right
	for c := minX - maxDim; c <= maxX+maxDim; c++ {
		tracking := false
		start := TilePoint{0, 0}
		for o := c; o <= maxDim; o++ {
			x, y := c+o, o
			if tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				n, 1, n,
				n, n, 0,
			}) {
				tracking = false
				walls = append(walls, TileSegment{start[0], start[1], x, y})
			} else if !tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				n, 1, 0,
				n, 0, 1,
			}) {
				tracking = true
				start = TilePoint{x, y}
			}
		}
	}

	// get top right to bottom left
	for c := maxX + maxDim; c >= minX-maxDim; c-- {
		tracking := false
		start := TilePoint{0, 0}
		for o := c; o <= maxDim; o++ {
			x, y := c-o, o
			if tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				n, 1, n,
				0, n, n,
			}) {
				tracking = false
				walls = append(walls, TileSegment{start[0], start[1], x, y})
			} else if !tracking && tilePatternExists(pool, x, y, TileMatrix{
				n, n, n,
				0, 1, n,
				1, 0, n,
			}) {
				tracking = true
				start = TilePoint{x, y}
			}
		}
	}

	gm.WallSegments = walls
	fmt.Println((gm.WallSegments))
}

func processFile(filename string) {
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
	gameMap.GenerateWalls()

	jsonMarshal, jsonErr := json.Marshal(gameMap)

	if jsonErr != nil {
		log.Fatal(jsonErr)
	}

	writeError := ioutil.WriteFile(outputPath, jsonMarshal, 0644)

	if writeError != nil {
		log.Fatal(writeError)
	}

}
