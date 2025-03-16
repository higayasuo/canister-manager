import {
  Actor,
  ActorSubclass,
  HttpAgent,
  AnonymousIdentity,
  Identity,
} from '@dfinity/agent';
import { IDL } from '@dfinity/candid';

/**
 * Configuration options for the CanisterManager
 */
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

/**
 * Parameters for creating an actor.
 */
type CreateActorParams = {
  canisterId: string;
  interfaceFactory: IDL.InterfaceFactory;
  identity?: Identity;
};

/**
 * A utility class for managing ICP canisters and their interactions
 *
 * This class provides methods to manage canister URLs and handle different
 * network environments (local vs. mainnet). It supports both local development
 * with Chrome's localhost subdomain feature and smartphone access via SSL.
 */
export class CanisterManager {
  private dfxNetwork: string;
  private localIPAddress: string;
  private replicaPort: number;
  private canisterPort: number;
  private internetIdentityPort: number;

  /**
   * Creates a new instance of CanisterManager
   *
   * @param config - Configuration options for the CanisterManager
   * @remarks
   * - For local development with Chrome, only replicaPort is required
   * - canisterPort and internetIdentityPort are only needed when accessing from a smartphone
   */
  constructor({
    dfxNetwork,
    localIPAddress,
    replicaPort = 4943,
    canisterPort = 14943,
    internetIdentityPort = 24943,
  }: CanisterManagerConfig) {
    this.dfxNetwork = dfxNetwork;
    this.localIPAddress = localIPAddress;
    this.replicaPort = replicaPort;
    this.canisterPort = canisterPort;
    this.internetIdentityPort = internetIdentityPort;
  }

  /**
   * Gets the backend URL for a canister
   *
   * @param canisterId - The ID of the canister
   * @returns The URL for backend canister communication
   * @remarks
   * - For mainnet, returns ic0.app URL
   * - For local development:
   *   - When on localhost: Returns localhost URL with replicaPort
   *   - When accessing externally: Returns URL with canisterPort
   */
  getBackendCanisterURL = (canisterId: string): string => {
    if (this.dfxNetwork !== 'local') {
      return `https://${canisterId}.ic0.app`;
    }

    if (window?.location?.origin?.includes('localhost')) {
      return `http://localhost:${this.replicaPort}/?canisterId=${canisterId}`;
    }

    return `https://${this.localIPAddress}:${this.canisterPort}/?canisterId=${canisterId}`;
  };

  /**
   * Gets the frontend URL for a canister
   *
   * @param canisterId - The ID of the canister
   * @returns The URL for frontend canister access
   * @remarks
   * - For mainnet, returns ic0.app URL
   * - For local development:
   *   - Chrome: Returns localhost subdomain URL
   *   - Other browsers: Returns URL with canisterPort (for smartphone access)
   */
  getFrontendCanisterURL = (canisterId: string): string => {
    if (this.dfxNetwork !== 'local') {
      return `https://${canisterId}.ic0.app`;
    }

    if (this.isLocalhostSubdomainSupported()) {
      return this.getLocalhostSubdomainCanisterURL(canisterId);
    }

    return `https://${this.localIPAddress}:${this.canisterPort}/?canisterId=${canisterId}`;
  };

  /**
   * Gets the Internet Identity URL
   *
   * @param canisterId - The ID of the canister
   * @returns The URL for Internet Identity service
   * @remarks
   * - For mainnet, returns identity.ic0.app
   * - For local development:
   *   - Chrome: Returns localhost subdomain URL
   *   - Other browsers: Returns URL with internetIdentityPort (for smartphone access)
   */
  getInternetIdentityURL = (canisterId: string): string => {
    if (this.dfxNetwork !== 'local') {
      return 'https://identity.ic0.app';
    }

    if (this.isLocalhostSubdomainSupported()) {
      return this.getLocalhostSubdomainCanisterURL(canisterId);
    }

    return `https://${this.localIPAddress}:${this.internetIdentityPort}/?canisterId=${canisterId}`;
  };

  /**
   * Checks if localhost subdomain support is available
   *
   * @returns boolean indicating if localhost subdomains are supported
   * @remarks
   * - Currently only Chrome supports localhost subdomains
   * - Other browsers require using canisterPort and internetIdentityPort for local development
   */
  isLocalhostSubdomainSupported = (): boolean => {
    if (!window?.location?.origin?.includes('localhost')) {
      return false;
    }

    const userAgent = window?.navigator?.userAgent?.toLowerCase() || '';

    // Chrome has built-in support for localhost subdomains
    if (userAgent.includes('chrome')) {
      return true;
    }

    // Safari and other browsers are not supported
    return false;
  };

  /**
   * Gets the localhost subdomain URL for a canister
   *
   * @param canisterId - The ID of the canister
   * @returns The localhost subdomain URL for the canister
   * @remarks
   * - Only used when running in Chrome on localhost
   * - Uses replicaPort instead of canisterPort or internetIdentityPort
   */
  getLocalhostSubdomainCanisterURL = (canisterId: string): string => {
    return `http://${canisterId}.localhost:${this.replicaPort}`;
  };

  createActor = <T>({
    canisterId,
    interfaceFactory,
    identity = new AnonymousIdentity(),
  }: CreateActorParams): ActorSubclass<T> => {
    const host = this.getBackendCanisterURL(canisterId);
    const httpAgentOptions = {
      host,
      identity,
      // fetchOptions: {
      //   reactNative: {
      //     __nativeResponseType: 'base64',
      //   },
      // },
      // callOptions: {
      //   reactNative: {
      //     textStreaming: true,
      //   },
      // },
    };

    const agent = new HttpAgent(httpAgentOptions);

    if (this.dfxNetwork === 'local') {
      agent.fetchRootKey().catch((err) => {
        console.warn(`Your local replica is not running: ${host}`);
        console.error(err);
        throw err;
      });
    }

    return Actor.createActor<T>(interfaceFactory, {
      agent,
      canisterId,
    });
  };
}
