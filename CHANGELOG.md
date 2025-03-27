# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.6] - 2024-03-27

### Changed

- Updated peer dependencies to accept any version of `@dfinity/agent` and `@dfinity/candid` for better compatibility

## [0.1.5] - 2024-03-16

### Changed

- Updated frontend canister URLs to use `icp0.io` domain instead of `ic0.app` for mainnet
- Updated documentation to clarify the difference between backend and frontend URLs

## [0.1.4] - 2024-03-16

### Removed

- Removed `createActor` method and related types
- Removed dependencies on `@dfinity/agent` and `@dfinity/candid`

### Changed

- Simplified package to focus solely on URL management functionality
- Updated documentation to reflect removal of actor creation functionality

## [0.1.3] - 2024-03-08

### Changed

- Removed `createActor` functionality to focus on URL management
- Removed dependencies on `@dfinity/agent` and `@dfinity/candid`
- Simplified the package to focus on core URL generation features

## [0.1.2] - 2024-03-08

### Changed

- Renamed `staticIpAddress` to `localIPAddress` for better clarity and alignment with local development terminology

## [0.1.1] - 2024-03-08

### Fixed

- Fixed test failures by properly mocking DOMStringList in window object
- Improved window mock implementation to better match browser environment
- Fixed type issues in test file by using proper type assertions

### Changed

- Renamed `localReplicaHostForSSL` to `staticIpAddress` for better clarity
- Updated documentation to clarify when different ports are needed
- Enhanced test descriptions to better reflect the purpose of each test case

### Added

- Added comprehensive test suite for URL generation methods
- Added tests for browser-specific behavior (Chrome vs other browsers)
- Added tests for localhost subdomain support
- Added tests for SSL URL generation for smartphone access

## [0.1.0] - 2024-03-08

### Added

- Initial release
- Basic canister management functionality
- Support for local development and mainnet environments
- SSL configuration for smartphone access
- Localhost subdomain support for Chrome
