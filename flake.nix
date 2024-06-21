{
  description = "Hyprland dashtodock implementation";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_22;
      in rec {
        packages = {
          default = pkgs.buildNpmPackage {
            name = "hyprland-dask-to-dock";
            src = ./.;
            npmDepsHash = "sha256-umiVLkD9gQA11vDfzEkdKIbz7n5jZ4MCHql++uz1Azk=";
            dontNpmInstall = true;
            postInstall = '' mv $out/bin/index.js $out/bin/hyprland-dask-to-dock.js '';
            meta = {
              description = "Hyprland dashtodock implementation";
              license = "MIT";
            };
          };
        };
        devShells = {
          default = pkgs.mkShell { 
            out=".";
            packages = [ nodejs pkgs.prefetch-npm-deps pkgs.nodePackages.pnpm ];
            shellHook = ''pnpm install; prefetch-npm-deps package-lock.json'';
          };
        };
      });
}
