{
  description = "Hyprland dashtodock implementation";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        packages = rec {
          executable = pkgs.writeShellScriptBin "hyprland-dash-to-dock" ''
            ${pkgs.bun}/bin/bun ${default}/bin/hyprland-dask-to-dock.js $@
          '';
          default = pkgs.buildNpmPackage {
            name = "hyprland-dask-to-dock";
            src = ./.;
            npmDepsHash = "sha256-RuxViAgj2Ev8hVfQWzfRNERdFM/ASBbYkmjy3bigh1c=";
            dontNpmInstall = true;
            postInstall = ''
              mv $out/bin/index.js $out/bin/hyprland-dask-to-dock.js
            '';
            meta = {
              description = "Hyprland dashtodock implementation";
              license = "MIT";
            };
          };
        };
        devShells = {
          default = pkgs.mkShell {
            out = ".";
            packages = [
              pkgs.prefetch-npm-deps
              pkgs.nodePackages.pnpm
              pkgs.bun
            ];
            shellHook = ''pnpm install; prefetch-npm-deps package-lock.json'';
          };
        };
      }
    );
}
