{
  description = "Node development shell";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  inputs.lets-spec.url = "github:andrewduckett/lets-spec";

  outputs =
    { nixpkgs, lets-spec, ... }:
    let
      lib = nixpkgs.lib;
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems =
        f: lib.genAttrs systems (system: f system nixpkgs.legacyPackages.${system});

      # "22", "v22" or "22.1.0" in .nvmrc all select nodejs_22.
      nodeMajor = lib.head (
        lib.splitString "." (lib.removePrefix "v" (lib.trim (builtins.readFile ./.nvmrc)))
      );
    in
    {
      devShells = forAllSystems (
        system: pkgs: {
          default = pkgs.mkShell {
            packages = [
              pkgs."nodejs_${nodeMajor}"
              lets-spec.packages.${system}.standard-github-labels
            ];
            # Skip the sync in CI, so lets-sync --check sees the committed tree.
            shellHook = ''
              if [ -z "''${CI:-}" ]; then lets-sync; fi
            '';
          };
        }
      );
    };
}
