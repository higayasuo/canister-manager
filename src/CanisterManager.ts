import {
  Actor,
  HttpAgent,
  ActorSubclass,
  Identity,
  AnonymousIdentity,
} from '@dfinity/agent';
import { IDL } from '@dfinity/candid';

/**
 * Configuration options for the CanisterManager
 */
type CanisterManagerConfig = {
  /** The DFX network to connect to (e.g., 'local', 'ic') */
  dfxNetwork: string;
  /** Static IP address for external access to local development server */
  staticIpAddress: string;
  /** Port for the local replica (default: 4943) */
  replicaPort?: number;
  /** Port for canister communication (default: 14943) */
  canisterPort?: number;
  /** Port for Internet Identity (default: 24943) */
  internetIdentityPort?: number;
};

/**
 * Parameters for creating an actor instance
 */
type CreateActorParams = {
  /** The ID of the canister to connect to */
  canisterId: string;
  /** The Candid interface factory for the canister */
  interfaceFactory: IDL.InterfaceFactory;
  /** Optional identity for authentication (defaults to AnonymousIdentity) */
  identity?: Identity;
};

/**
 * A utility class for managing ICP canisters and their interactions
 *
 * This class provides methods to create actors, manage canister URLs,
 * and handle different network environments (local vs. mainnet).
 */
export class CanisterManager {
  private dfxNetwork: string;
  private staticIpAddress: string;
  private replicaPort: number;
  private canisterPort: number;
  private internetIdentityPort: number;

  /**
   * Creates a new instance of CanisterManager
   *
   * @param config - Configuration options for the CanisterManager
   */
  constructor({
    dfxNetwork,
    staticIpAddress,
    replicaPort = 4943,
    canisterPort = 14943,
    internetIdentityPort = 24943,
  }: CanisterManagerConfig) {
    this.dfxNetwork = dfxNetwork;
    this.staticIpAddress = staticIpAddress;
    this.replicaPort = replicaPort;
    this.canisterPort = canisterPort;
    this.internetIdentityPort = internetIdentityPort;
  }

  /**
   * Creates an actor instance for interacting with a canister
   *
   * @param params - Parameters for creating the actor
   * @returns An actor instance that can be used to call canister methods
   */
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

  /**
   * Gets the backend URL for a canister
   *
   * @param canisterId - The ID of the canister
   * @returns The URL for backend canister communication
   */
  getBackendCanisterURL = (canisterId: string): string => {
    if (this.dfxNetwork !== 'local') {
      return `https://${canisterId}.ic0.app`;
    }

    return `https://${this.staticIpAddress}:${this.canisterPort}/?canisterId=${canisterId}`;
  };

  /**
   * Gets the frontend URL for a canister
   *
   * @param canisterId - The ID of the canister
   * @returns The URL for frontend canister access
   */
  getFrontendCanisterURL = (canisterId: string): string => {
    if (this.dfxNetwork !== 'local') {
      return `https://${canisterId}.ic0.app`;
    }

    if (this.isLocalhostSubdomainSupported()) {
      return this.getLocalhostSubdomainCanisterURL(canisterId);
    }

    return `https://${this.staticIpAddress}:${this.canisterPort}/?canisterId=${canisterId}`;
  };

  /**
   * Gets the Internet Identity URL
   *
   * @param canisterId - The ID of the canister
   * @returns The URL for Internet Identity service
   */
  getInternetIdentityURL = (canisterId: string): string => {
    if (this.dfxNetwork !== 'local') {
      return 'https://identity.ic0.app';
    }

    if (this.isLocalhostSubdomainSupported()) {
      return this.getLocalhostSubdomainCanisterURL(canisterId);
    }

    return `https://${this.staticIpAddress}:${this.internetIdentityPort}/?canisterId=${canisterId}`;
  };

  /**
   * Checks if localhost subdomain support is available
   *
   * @returns boolean indicating if localhost subdomains are supported
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
   */
  getLocalhostSubdomainCanisterURL = (canisterId: string): string => {
    return `http://${canisterId}.localhost:${this.replicaPort}`;
  };
}
