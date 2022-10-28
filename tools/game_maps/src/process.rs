use image::{self, GenericImageView};

use crate::{GameMap, MapPNG};

pub fn get_gamep_maps(map_pngs: &Vec<MapPNG>) {
    for map_png in map_pngs {
        let path = map_png.path.path();
        let path = match path.to_str() {
            Some(p) => p,
            None => {
                println!("Skipping a path...");
                continue;
            }
        };

        let img = match image::open(path) {
            Ok(img) => img,
            Err(_) => {
                print!("Could not open image {}", path);
                continue;
            }
        };

        let mut game_map = GameMap {
            wall_tiles: Vec::new(),
            spawn_tiles: Vec::new(),
            wall_segments: Vec::new(),
            wall_segment_tiles: Vec::new(),
        };

        for (x, y, rgba) in img.pixels() {
            let [r, g, b, a] = rgba.0;
            if a != 255 {
                continue;
            }

            // wall tiles
            if r + g + b == 0 {
                game_map.wall_tiles.push([x as i64, y as i64]);
            }

            // spawn tiles
            if r == 255 && g + b == 0 {
                game_map.spawn_tiles.push([x as i64, y as i64]);
            }
        }

        game_map.center_tiles();
        game_map.log();
    }
}
