# Canister Manager

A utility to make ICP Canisters easier to handle. This package provides a simple interface for managing Internet Computer (ICP) canisters, handling both local development and mainnet environments.

## Features

- Automatic URL management for local and mainnet environments
- Support for localhost subdomains in Chrome
- Internet Identity URL management
- TypeScript support
- SSL configuration support for local development
- Expo development server support

## Installation

```bash
npm install canister-manager
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install @dfinity/agent @dfinity/candid
```

## Usage

### Basic Setup

```typescript
import { CanisterManager } from 'canister-manager';

// Initialize the manager
const manager = new CanisterManager({
  dfxNetwork: 'local', // or 'ic' for mainnet
  localIPAddress: '192.168.0.210', // Your local IP address for external access
  // Optional: customize ports
  replicaPort: 4943, // Required for local development
  // The following ports are only needed when accessing from a smartphone
  canisterPort: 14943, // For canister communication via SSL
  internetIdentityPort: 24943, // For Internet Identity via SSL
});
```

### URL Management

```typescript
// Get backend URL for canister communication
const backendUrl = manager.getBackendCanisterURL('your-canister-id');

// Get frontend URL for canister access
const frontendUrl = manager.getFrontendCanisterURL('your-canister-id');

// Get Internet Identity URL
const iiUrl = manager.getInternetIdentityURL('your-canister-id');
```

### Local Development

The manager automatically handles different environments:

- For mainnet (`dfxNetwork: 'ic'`):

  - Backend URLs: `https://<canister-id>.ic0.app`
  - Frontend URLs: `https://<canister-id>.icp0.io`
  - Internet Identity: `https://identity.ic0.app`

- For local development (`dfxNetwork: 'local'`):
  - Chrome: Supports localhost subdomains (`http://<canister-id>.localhost:4943`)
  - Other browsers: Falls back to query parameter URLs
  - Smartphone access: Requires SSL configuration with custom ports

#### Port Configuration

- `replicaPort` (default: 4943): Required for local development
- `canisterPort` (default: 14943): Only needed for smartphone access via SSL
- `internetIdentityPort` (default: 24943): Only needed for smartphone access via SSL

When developing locally with Chrome, you only need to specify the `replicaPort`. The other ports are only required when you need to access the local development server from a smartphone.

#### SSL Configuration for Local Development

To connect to a local replica from a web application or native app on a smartphone, SSL configuration is required. Here's how to set it up:

##### 1. Set Up Static IP Address

To access the development server on your PC from a smartphone, you need to set up a static IP address. This ensures the IP address remains unchanged even after PC restart, enabling stable connectivity.

###### macOS

1. Open "System Settings" from the Apple menu
2. Click "Network" in the sidebar
3. Select your active network connection (Wi-Fi or Ethernet) and click "Details"
4. Open the "TCP/IP" tab
5. From the "Configure IPv4" dropdown menu, select "Using DHCP with manual address" and enter:
   - IP Address: Recommended to use range 192.168.0.200-192.168.0.254 to avoid conflicts with DHCP dynamic assignments.
     For example, you could use 192.168.0.210.

##### 2. Install mkcert

mkcert is a tool for easily implementing HTTPS communication in local development environments.

###### macOS Installation

```bash
brew install mkcert
brew install nss # Required if using Firefox
```

###### Root CA Setup

```bash
mkcert -install
```

###### Check Root Certificate Location

```bash
mkcert -CAROOT
```

###### Installing Root Certificate on iOS

- Send rootCA.pem file to iOS device
- Install from "Profile Downloaded" in Settings app
- Enable mkcert certificate in Settings → General → About → Certificate Trust Settings

###### Installing Root Certificate on Android

- Transfer rootCA.pem file to Android device
- Go to Settings → Security → More → Install from storage
- Select and install as CA certificate

**Important Notes**

- nss installation is mandatory when using Firefox
- Never share generated key files
- Root certificate installation process may vary depending on Android device model

##### 3. Create Server Certificate

###### Preparation

```bash
mkdir .mkcert
cd .mkcert
```

###### Certificate Creation

```bash
mkcert [static IP address]
```

The following files will be generated:

- `[static IP address].pem` - Server certificate
- `[static IP address]-key.pem` - Private key

##### 4. Configure local-ssl-proxy

Update your package.json with SSL proxy configurations:

```json
{
  "scripts": {
    "ssl:canisters": "local-ssl-proxy --key ./.mkcert/[static IP address]-key.pem --cert ./.mkcert/[static IP address].pem --source 14943 --target 4943",
    "ssl:ii": "local-ssl-proxy --key ./.mkcert/[static IP address]-key.pem --cert ./.mkcert/[static IP address].pem --source 24943 --target 4943",
    "ssl:web": "local-ssl-proxy --key ./.mkcert/[static IP address]-key.pem --cert ./.mkcert/[static IP address].pem --source 18081 --target 8081"
  },
  "devDependencies": {
    "local-ssl-proxy": "^2.0.5"
  }
}
```

Each configuration does the following:

- `ssl:canisters`: Provides HTTPS connection for Canisters (14943→4943)
- `ssl:ii`: Provides HTTPS connection for Internet Identity (24943→4943)
- `ssl:web`: Provides HTTPS connection for Expo development server (18081→8081), enabling mobile app testing

**Important Notes**

- Replace `[static IP address]` with the static IP address you configured earlier
- Ensure the server certificate and private key file paths match the location of files generated by mkcert
- The `ssl:web` proxy is specifically for accessing Expo's development server from mobile devices

##### 5. Start DFX and Deploy Canisters

First, start DFX and deploy your canisters:

```bash
# Start DFX with SSL
dfx start --clean

# In a new terminal, deploy your canisters
dfx deploy
```

##### 6. Start local-ssl-proxy

After DFX is running and canisters are deployed, launch the SSL proxy servers:

```bash
# Terminal 1: Start canister proxy
npm run ssl:canisters

# Terminal 2: Start Internet Identity proxy
npm run ssl:ii

# Terminal 3: Start Expo development server proxy (if using Expo)
npm run ssl:web
```

These commands do the following:

1. `ssl:canisters` provides HTTPS connection for Canisters (14943→4943)
2. `ssl:ii` provides HTTPS connection for Internet Identity (24943→4943)
3. `ssl:web` provides HTTPS connection for Expo development server (18081→8081), enabling mobile app testing

**Important Notes**

- Run each command in a separate new terminal
- Before running commands, ensure target ports are not in use
- Verify SSL certificate paths are correctly configured
- After launch, each can be stopped individually with Ctrl+C
- The Expo development server must be running on port 8081 before starting the `ssl:web` proxy
- Always start DFX and deploy canisters before starting the local-ssl-proxy servers

##### 7. Update your application configuration

```typescript
const manager = new CanisterManager({
  dfxNetwork: 'local',
  localIPAddress: '192.168.0.210', // Your local IP address for external access
  // Use default ports unless you've configured custom ones
  replicaPort: 4943,
  canisterPort: 14943, // Only needed for smartphone access
  internetIdentityPort: 24943, // Only needed for smartphone access
});
```

##### 8. Access from different devices

- **Web Browser**: Use `https://<your-ip>:<port>/?canisterId=<canister-id>`
- **Mobile App**: Use the same URL format as web browser
- **Chrome on Desktop**: Supports localhost subdomains (`http://<canister-id>.localhost:4943`)
- **Expo App**: Use `https://<your-ip>:18081` to access the development server

#### Common Issues and Solutions

1. **SSL Certificate Errors**:

   - For development, you may need to accept self-signed certificates in your browser
   - For mobile apps, you might need to configure certificate pinning or disable SSL verification in development
   - Ensure mkcert root certificate is properly installed on all devices
   - Verify that the server certificate matches your static IP address

2. **Connection Issues**:

   - Ensure your device is on the same network as your development machine
   - Check if your firewall allows connections to the specified ports
   - Verify that the IP address is correct and accessible
   - Make sure mkcert is properly installed and configured
   - Confirm that your static IP address is properly set and not conflicting with other devices
   - Verify that all local-ssl-proxy instances are running correctly
   - For Expo development server, ensure the Expo server is running before starting the proxy
   - Make sure DFX is running and canisters are deployed before starting local-ssl-proxy

3. **Port Conflicts**:
   - If the default ports are in use, you can customize them in the configuration
   - Make sure to update your DFX configuration to match the custom ports
   - Verify that the local-ssl-proxy ports match your application configuration
   - Check that no other services are using the required ports
   - Ensure Expo development server is running on port 8081

## Configuration Options

```typescript
type CanisterManagerConfig = {
  /** The DFX network to connect to (e.g., 'local', 'ic') */
  dfxNetwork: string;
  /** Local IP address for external access to local development server */
  localIPAddress: string;
  /** Port for the local replica (default: 4943) */
  replicaPort?: number;
  /** Port for canister communication via SSL (default: 14943). Only needed for smartphone access. */
  canisterPort?: number;
  /** Port for Internet Identity via SSL (default: 24943). Only needed for smartphone access. */
  internetIdentityPort?: number;
};
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## License

MIT
