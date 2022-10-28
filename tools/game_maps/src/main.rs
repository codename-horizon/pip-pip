use game_maps::{get_gamep_maps, get_map_pngs};

fn main() {
    let pngs = get_map_pngs().expect("Could not get pngs.");

    get_gamep_maps(&pngs);
}
