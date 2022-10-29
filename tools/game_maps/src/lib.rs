use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs::DirEntry};

#[derive(Debug)]
pub struct MapPNG {
    pub path: DirEntry,
}

pub type GameMapTile = [i64; 2];
pub type GameMapSegment = [i64; 4];
pub type GameTileExistHashMap = HashMap<String, bool>;

pub struct GameTileComputations;

pub const MAP_DIR: &str = "../../packages/game/maps/";
pub const OUTPUT_DIR: &str = "../../packages/game/src/maps/";

impl GameTileComputations {
    fn tile_to_key([x, y]: &GameMapTile) -> String {
        Self::xy_to_key(*x, *y)
    }

    fn xy_to_key(x: i64, y: i64) -> String{
        format!("{}-{}", x, y)
    }

    fn create_tile_exist_hash_map(tiles: &Vec<&GameMapTile>) -> GameTileExistHashMap {
        let mut hash = HashMap::new();

        for tile in tiles {
            hash.insert(Self::tile_to_key(tile), true);
        }

        hash
    }

    // fn tile_exists(tiles: &Vec<&GameMapTile>, x: i64, y: i64) -> bool {
    //     tiles.iter().any(|&t| t[0] == x && t[1] == y)
    // }

    fn tile_exists_in_hash_map(hash_map: &GameTileExistHashMap, x: i64, y: i64) -> bool {
        let key = Self::xy_to_key(x, y);
        match hash_map.get(&key) {
            Some(_) => true,
            None => false,
        }
    }

    fn count_neighbors(hash_map: &GameTileExistHashMap, tile: &GameMapTile) -> (u8, u8) {
        let mut corners = 0;
        let mut sides = 0;

        // corners
        for x_offset in (-1..=1).step_by(2) {
            for y_offset in (-1..=1).step_by(2) {
                if Self::tile_exists_in_hash_map(hash_map, tile[0] + x_offset, tile[1] + y_offset) {
                    corners += 1;
                }
            }
        }

        // left and right sides
        for offset in (-1..=1).step_by(2) {
            if Self::tile_exists_in_hash_map(hash_map, tile[0] + offset, tile[1]) {
                sides += 1;
            }
        }

        // top and bottom sides
        for offset in (-1..=1).step_by(2) {
            if Self::tile_exists_in_hash_map(hash_map, tile[0], tile[1] + offset) {
                sides += 1;
            }
        }

        (sides, corners)
    }

    fn get_segment_triggers(
        hash_map: &GameTileExistHashMap,
        tile: &GameMapTile,
        x_offset: i64,
        y_offset: i64,
    ) -> (bool, bool) {
        let [x, y] = &tile;
        let (sides, corners) = GameTileComputations::count_neighbors(hash_map, tile);

        let sides = sides <= 3;
        let corners = corners <= 3;
        let neighbors = sides || corners;

        let yes = GameTileComputations::tile_exists_in_hash_map(hash_map, *x, *y) && neighbors;
        let start = yes && GameTileComputations::tile_exists_in_hash_map(hash_map, *x + x_offset, *y + y_offset);

        (yes, start)
    }
}

#[derive(Debug)]
pub struct GameMapBounds {
    max_x: i64,
    min_x: i64,
    max_y: i64,
    min_y: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GameMap {
    wall_tiles: Vec<GameMapTile>,
    spawn_tiles: Vec<GameMapTile>,
    wall_segments: Vec<GameMapSegment>,
    wall_segment_tiles: Vec<GameMapTile>,
}

impl GameMap {
    fn borrow_tiles(&self) -> Vec<&GameMapTile> {
        let mut pool: Vec<&GameMapTile> = Vec::new();
        pool.extend(&self.wall_tiles);
        pool.extend(&self.spawn_tiles);
        pool
    }

    fn get_bounds(&self) -> GameMapBounds {
        let mut min_x = i64::MAX;
        let mut min_y = i64::MAX;
        let mut max_x = i64::MIN;
        let mut max_y = i64::MIN;

        let pool = self.borrow_tiles();

        for [x, y] in pool {
            if x > &max_x {
                max_x = *x
            }
            if x < &min_x {
                min_x = *x
            }
            if y > &max_y {
                max_y = *y
            }
            if y < &min_y {
                min_y = *y
            }
        }

        GameMapBounds {
            max_x,
            min_x,
            max_y,
            min_y,
        }
    }

    fn center_tiles(&mut self) {
        let bounds = self.get_bounds();
        let ave_x = (bounds.min_x + bounds.max_x) / 2;
        let ave_y = (bounds.min_y + bounds.max_y) / 2;

        let center = |pool: &mut Vec<GameMapTile>| {
            for [x, y] in pool {
                *x -= ave_x;
                *y -= ave_y;
            }
        };

        center(&mut self.wall_tiles);
        center(&mut self.spawn_tiles);
    }

    fn generate_segments(&mut self) {
        self.wall_segments = vec![];
        let mut tile_pool: Vec<&GameMapTile> = vec![];

        let mut wall_pool: Vec<&GameMapTile> = vec![];
        wall_pool.extend(&self.wall_tiles);

        let wall_pool_hash_map = GameTileComputations::create_tile_exist_hash_map(&wall_pool);

        // select tiles that'll be used for the segments
        for tile in &wall_pool {
            let (sides, corners) = GameTileComputations::count_neighbors(&wall_pool_hash_map, tile);
            if sides + corners < 8 {
                tile_pool.push(tile);
            }
        }

        let bounds = self.get_bounds();

        // horizontal
        for y in bounds.min_y..=bounds.max_y {
            let mut tracking = false;
            let mut x_start = 0;
            let mut y_start = 0;
            for x in bounds.min_x..=bounds.max_x {
                let tile = [x, y];
                let (yes, start) =
                    GameTileComputations::get_segment_triggers(&wall_pool_hash_map, &tile, 1, 0);
                if tracking {
                    if !yes {
                        self.wall_segments.push([x_start, y_start, x - 1, y]);
                        tracking = false;
                    }
                } else if start {
                    tracking = true;
                    x_start = x;
                    y_start = y;
                }
            }
        }

        // vertical
        for x in bounds.min_x..=bounds.max_x {
            let mut tracking = false;
            let mut x_start = 0;
            let mut y_start = 0;
            for y in bounds.min_y..=bounds.max_y {
                let tile = [x, y];
                let (yes, start) =
                    GameTileComputations::get_segment_triggers(&wall_pool_hash_map, &tile, 0, 1);
                if tracking {
                    if !yes {
                        self.wall_segments.push([x_start, y_start, x, y - 1]);
                        tracking = false;
                    }
                } else if start {
                    tracking = true;
                    x_start = x;
                    y_start = y;
                }
            }
        }

        // lone tiles
        for tile in &wall_pool {
            let (sides, corners) = GameTileComputations::count_neighbors(&wall_pool_hash_map, tile);
            if sides + corners <= 2 {
                let [x, y] = **tile;
                self.wall_segments.push([x, y, x, y]);
            }
        }

        // wall segment tiles
        for tile in tile_pool {
            self.wall_segment_tiles.push(*tile);
        }
    }
}

mod fs;
pub use fs::*;

mod process;
pub use process::*;
