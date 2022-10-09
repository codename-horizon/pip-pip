package main

import (
	"encoding/json"
	"fmt"
	"image/png"
	"io/ioutil"
	"log"
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

type TilePos = []int

type GameMap struct {
	Walls  []TilePos `json:"walls"`
	Spawns []TilePos `json:"spawns"`
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

	jsonMarshal, jsonErr := json.Marshal(gameMap)

	if jsonErr != nil {
		log.Fatal(jsonErr)
	}

	writeError := ioutil.WriteFile(outputPath, jsonMarshal, 0644)

	if writeError != nil {
		log.Fatal(writeError)
	}

}
