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

type TilePos []int
type TilePosArr []TilePos

type GameMap struct {
	Walls  TilePosArr `json:"walls"`
	Spawns TilePosArr `json:"spawns"`
}

func transpose(t TilePosArr, x int, y int) TilePosArr {
	output := TilePosArr{}

	for i := 0; i < len(t); i++ {
		transposed := TilePos{t[i][0] + x, t[i][1] + y}
		output = append(output, transposed)
	}

	return output
}

func (gm *GameMap) Transpose(x int, y int) {
	gm.Walls = transpose(gm.Walls, x, y)
	gm.Spawns = transpose(gm.Spawns, x, y)
}

func (gm *GameMap) Center() {
	pool := TilePosArr{}
	pool = append(pool, gm.Walls...)
	pool = append(pool, gm.Spawns...)

	minX := math.MaxInt64
	maxX := -math.MaxInt64
	minY := math.MaxInt64
	maxY := -math.MaxInt64

	for i := 0; i < len(pool); i++ {
		x := pool[i][0]
		y := pool[i][1]

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

	centerX := (maxX + minX) / 2
	centerY := (maxY + minY) / 2

	gm.Transpose(-centerX, -centerY)
}

func processFile(filename string) {
	inputPath := SRC_MAPS_DIR + "/" + filename
	outputPath := OUT_MAPS_DIR + "/" + strings.Replace(filename, FILE_FORMAT, ".json", -1)

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
			r := uint8(_r)
			g := uint8(_g)
			b := uint8(_b)
			a := uint8(_a)

			// wall
			if r == 0 && g == 0 && b == 0 && a == 255 {
				gameMap.Walls = append(gameMap.Walls, TilePos{x, y})
			}

			// spawn
			if r == 255 && g == 0 && b == 0 && a == 255 {
				gameMap.Spawns = append(gameMap.Spawns, TilePos{x, y})
			}
		}
	}

	gameMap.Center()

	jsonMarshal, jsonErr := json.Marshal(gameMap)

	if jsonErr != nil {
		log.Fatal(jsonErr)
	}

	writeError := ioutil.WriteFile(outputPath, jsonMarshal, 0644)

	if writeError != nil {
		log.Fatal(writeError)
	}

}
