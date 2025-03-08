import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanisterManager } from '../src/CanisterManager';
import { HttpAgent, AnonymousIdentity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';

// Mock the @dfinity/agent module
vi.mock('@dfinity/agent', () => ({
  Actor: {
    createActor: vi.fn(),
  },
  HttpAgent: vi.fn(),
  AnonymousIdentity: vi.fn(),
}));

type MockWindow = {
  location: {
    origin: string;
  };
  navigator: {
    userAgent: string;
  };
};

describe('CanisterManager', () => {
  let manager: CanisterManager;
  const mockConfig = {
    dfxNetwork: 'local',
    staticIpAddress: 'localhost',
    replicaPort: 4943,
    canisterPort: 14943,
    internetIdentityPort: 24943,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a new instance for each test
    manager = new CanisterManager(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with default ports when not provided', () => {
      const manager = new CanisterManager({
        dfxNetwork: 'local',
        staticIpAddress: 'localhost',
      });

      expect(manager).toBeDefined();
    });

    it('should initialize with custom ports when provided', () => {
      const customPorts = {
        dfxNetwork: 'local',
        staticIpAddress: 'localhost',
        replicaPort: 5000,
        canisterPort: 5001,
        internetIdentityPort: 5002,
      };

      const manager = new CanisterManager(customPorts);
      expect(manager).toBeDefined();
    });
  });

  describe('createActor', () => {
    const mockCanisterId = 'test-canister-id';
    const mockInterfaceFactory = {} as IDL.InterfaceFactory;
    const mockIdentity = new AnonymousIdentity();

    beforeEach(() => {
      // Mock HttpAgent constructor
      (HttpAgent as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          fetchRootKey: vi.fn().mockResolvedValue(undefined),
        }),
      );
    });

    it('should create an actor with default anonymous identity', () => {
      manager.createActor({
        canisterId: mockCanisterId,
        interfaceFactory: mockInterfaceFactory,
      });

      expect(HttpAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.stringContaining(mockCanisterId),
          identity: expect.any(AnonymousIdentity),
        }),
      );
    });

    it('should create an actor with provided identity', () => {
      manager.createActor({
        canisterId: mockCanisterId,
        interfaceFactory: mockInterfaceFactory,
        identity: mockIdentity,
      });

      expect(HttpAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.stringContaining(mockCanisterId),
          identity: mockIdentity,
        }),
      );
    });

    it('should fetch root key for local network', async () => {
      const mockAgent = {
        fetchRootKey: vi.fn().mockResolvedValue(undefined),
      };
      (HttpAgent as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => mockAgent,
      );

      await manager.createActor({
        canisterId: mockCanisterId,
        interfaceFactory: mockInterfaceFactory,
      });

      expect(mockAgent.fetchRootKey).toHaveBeenCalled();
    });
  });

  describe('URL generation methods', () => {
    const mockCanisterId = 'test-canister-id';

    describe('getBackendCanisterURL', () => {
      it('should return ic0.app URL for non-local network', () => {
        const manager = new CanisterManager({
          ...mockConfig,
          dfxNetwork: 'ic',
        });

        const url = manager.getBackendCanisterURL(mockCanisterId);
        expect(url).toBe(`https://${mockCanisterId}.ic0.app`);
      });

      it('should return local URL for local network', () => {
        const url = manager.getBackendCanisterURL(mockCanisterId);
        expect(url).toBe(
          `https://${mockConfig.staticIpAddress}:${mockConfig.canisterPort}/?canisterId=${mockCanisterId}`,
        );
      });
    });

    describe('getFrontendCanisterURL', () => {
      it('should return ic0.app URL for non-local network', () => {
        const manager = new CanisterManager({
          ...mockConfig,
          dfxNetwork: 'ic',
        });

        const url = manager.getFrontendCanisterURL(mockCanisterId);
        expect(url).toBe(`https://${mockCanisterId}.ic0.app`);
      });

      it('should return local URL for local network without subdomain support', () => {
        // Mock window object
        const mockWindow: MockWindow = {
          location: { origin: 'http://localhost:3000' },
          navigator: { userAgent: 'Safari' },
        };
        (global as any).window = mockWindow;

        const url = manager.getFrontendCanisterURL(mockCanisterId);
        expect(url).toBe(
          `https://${mockConfig.staticIpAddress}:${mockConfig.canisterPort}/?canisterId=${mockCanisterId}`,
        );
      });
    });

    describe('getInternetIdentityURL', () => {
      it('should return ic0.app URL for non-local network', () => {
        const manager = new CanisterManager({
          ...mockConfig,
          dfxNetwork: 'ic',
        });

        const url = manager.getInternetIdentityURL(mockCanisterId);
        expect(url).toBe('https://identity.ic0.app');
      });

      it('should return local URL for local network', () => {
        const url = manager.getInternetIdentityURL(mockCanisterId);
        expect(url).toBe(
          `https://${mockConfig.staticIpAddress}:${mockConfig.internetIdentityPort}/?canisterId=${mockCanisterId}`,
        );
      });
    });
  });

  describe('localhost subdomain support', () => {
    describe('isLocalhostSubdomainSupported', () => {
      it('should return false when not on localhost', () => {
        const mockWindow: MockWindow = {
          location: { origin: 'https://example.com' },
          navigator: { userAgent: 'Chrome' },
        };
        (global as any).window = mockWindow;

        expect(manager.isLocalhostSubdomainSupported()).toBe(false);
      });

      it('should return true for Chrome on localhost', () => {
        const mockWindow: MockWindow = {
          location: { origin: 'http://localhost:3000' },
          navigator: { userAgent: 'Chrome' },
        };
        (global as any).window = mockWindow;

        expect(manager.isLocalhostSubdomainSupported()).toBe(true);
      });

      it('should return false for Safari on localhost', () => {
        const mockWindow: MockWindow = {
          location: { origin: 'http://localhost:3000' },
          navigator: { userAgent: 'Safari' },
        };
        (global as any).window = mockWindow;

        expect(manager.isLocalhostSubdomainSupported()).toBe(false);
      });
    });

    describe('getLocalhostSubdomainCanisterURL', () => {
      it('should return correct localhost subdomain URL', () => {
        const mockCanisterId = 'test-canister-id';
        const url = manager.getLocalhostSubdomainCanisterURL(mockCanisterId);
        expect(url).toBe(
          `http://${mockCanisterId}.localhost:${mockConfig.replicaPort}`,
        );
      });
    });
  });
});
