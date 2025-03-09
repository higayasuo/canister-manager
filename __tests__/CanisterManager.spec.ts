import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanisterManager } from '../src/CanisterManager';

// Create a minimal mock of the Window interface
const createMockWindow = (
  origin: string,
  userAgent: string,
): Window & typeof globalThis => {
  const mockWindow = {
    location: {
      origin,
      hash: '',
      host: '',
      hostname: '',
      href: '',
      pathname: '',
      port: '',
      protocol: '',
      search: '',
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
      ancestorOrigins: {
        length: 0,
        contains: vi.fn(),
        item: vi.fn(),
        [Symbol.iterator]: vi.fn(),
      },
    },
    navigator: {
      userAgent,
      clipboard: null,
      connection: null,
      cookieEnabled: false,
      deviceMemory: 0,
      doNotTrack: null,
      hardwareConcurrency: 0,
      language: '',
      languages: [],
      maxTouchPoints: 0,
      onLine: true,
      platform: '',
      serviceWorker: null,
      storage: null,
      vendor: '',
    },
    // Add required Window properties
    clientInformation: null,
    closed: false,
    customElements: null,
    devicePixelRatio: 1,
    document: null,
    external: null,
    frameElement: null,
    frames: null,
    history: null,
    innerHeight: 0,
    innerWidth: 0,
    length: 0,
    localStorage: null,
    locationbar: null,
    menubar: null,
    name: '',
    opener: null,
    outerHeight: 0,
    outerWidth: 0,
    pageXOffset: 0,
    pageYOffset: 0,
    parent: null,
    screen: null,
    screenLeft: 0,
    screenTop: 0,
    screenX: 0,
    screenY: 0,
    scrollX: 0,
    scrollY: 0,
    self: null,
    sessionStorage: null,
    status: '',
    statusbar: null,
    toolbar: null,
    top: null,
    visualViewport: null,
    window: null,
    // Add required globalThis properties
    globalThis: null,
    eval: vi.fn(),
    parseInt: vi.fn(),
    parseFloat: vi.fn(),
    isNaN: vi.fn(),
    isFinite: vi.fn(),
    decodeURI: vi.fn(),
    decodeURIComponent: vi.fn(),
    encodeURI: vi.fn(),
    encodeURIComponent: vi.fn(),
    escape: vi.fn(),
    unescape: vi.fn(),
  } as unknown as Window & typeof globalThis;

  return mockWindow;
};

describe('CanisterManager', () => {
  let manager: CanisterManager;
  const mockConfig = {
    dfxNetwork: 'local',
    localIPAddress: 'localhost',
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
    it('should initialize with only replicaPort for Chrome local development', () => {
      const manager = new CanisterManager({
        dfxNetwork: 'local',
        localIPAddress: 'localhost',
        replicaPort: 4943,
      });

      expect(manager).toBeDefined();
    });

    it('should initialize with all ports for smartphone access', () => {
      const customPorts = {
        dfxNetwork: 'local',
        localIPAddress: 'localhost',
        replicaPort: 4943,
        canisterPort: 14943,
        internetIdentityPort: 24943,
      };

      const manager = new CanisterManager(customPorts);
      expect(manager).toBeDefined();
    });
  });

  describe('URL generation methods', () => {
    const mockCanisterId = 'test-canister-id';

    describe('getBackendCanisterURL', () => {
      it('should return ic0.app URL for mainnet', () => {
        const manager = new CanisterManager({
          ...mockConfig,
          dfxNetwork: 'ic',
        });

        const url = manager.getBackendCanisterURL(mockCanisterId);
        expect(url).toBe(`https://${mockCanisterId}.ic0.app`);
      });

      it('should return localhost URL when on localhost', () => {
        global.window = createMockWindow('http://localhost:3000', 'Chrome');

        const url = manager.getBackendCanisterURL(mockCanisterId);
        expect(url).toBe(
          `http://localhost:${mockConfig.replicaPort}/?canisterId=${mockCanisterId}`,
        );
      });

      it('should return SSL URL when accessing externally', () => {
        global.window = createMockWindow(
          'https://192.168.1.100:3000',
          'Chrome',
        );

        const url = manager.getBackendCanisterURL(mockCanisterId);
        expect(url).toBe(
          `https://${mockConfig.localIPAddress}:${mockConfig.canisterPort}/?canisterId=${mockCanisterId}`,
        );
      });
    });

    describe('getFrontendCanisterURL', () => {
      it('should return ic0.app URL for mainnet', () => {
        const manager = new CanisterManager({
          ...mockConfig,
          dfxNetwork: 'ic',
        });

        const url = manager.getFrontendCanisterURL(mockCanisterId);
        expect(url).toBe(`https://${mockCanisterId}.ic0.app`);
      });

      it('should return localhost subdomain URL for Chrome', () => {
        // Mock window object for Chrome
        global.window = createMockWindow('http://localhost:3000', 'Chrome');

        const url = manager.getFrontendCanisterURL(mockCanisterId);
        expect(url).toBe(
          `http://${mockCanisterId}.localhost:${mockConfig.replicaPort}`,
        );
      });

      it('should return SSL URL for non-Chrome browsers', () => {
        // Mock window object for Safari
        global.window = createMockWindow('http://localhost:3000', 'Safari');

        const url = manager.getFrontendCanisterURL(mockCanisterId);
        expect(url).toBe(
          `https://${mockConfig.localIPAddress}:${mockConfig.canisterPort}/?canisterId=${mockCanisterId}`,
        );
      });
    });

    describe('getInternetIdentityURL', () => {
      it('should return ic0.app URL for mainnet', () => {
        const manager = new CanisterManager({
          ...mockConfig,
          dfxNetwork: 'ic',
        });

        const url = manager.getInternetIdentityURL(mockCanisterId);
        expect(url).toBe('https://identity.ic0.app');
      });

      it('should return localhost subdomain URL for Chrome', () => {
        // Mock window object for Chrome
        global.window = createMockWindow('http://localhost:3000', 'Chrome');

        const url = manager.getInternetIdentityURL(mockCanisterId);
        expect(url).toBe(
          `http://${mockCanisterId}.localhost:${mockConfig.replicaPort}`,
        );
      });

      it('should return SSL URL for non-Chrome browsers', () => {
        // Mock window object for Safari
        global.window = createMockWindow('http://localhost:3000', 'Safari');

        const url = manager.getInternetIdentityURL(mockCanisterId);
        expect(url).toBe(
          `https://${mockConfig.localIPAddress}:${mockConfig.internetIdentityPort}/?canisterId=${mockCanisterId}`,
        );
      });
    });
  });

  describe('localhost subdomain support', () => {
    describe('isLocalhostSubdomainSupported', () => {
      it('should return false when not on localhost', () => {
        global.window = createMockWindow('https://example.com', 'Chrome');

        expect(manager.isLocalhostSubdomainSupported()).toBe(false);
      });

      it('should return true for Chrome on localhost', () => {
        global.window = createMockWindow('http://localhost:3000', 'Chrome');

        expect(manager.isLocalhostSubdomainSupported()).toBe(true);
      });

      it('should return false for Safari on localhost', () => {
        global.window = createMockWindow('http://localhost:3000', 'Safari');

        expect(manager.isLocalhostSubdomainSupported()).toBe(false);
      });

      it('should return false for Firefox on localhost', () => {
        global.window = createMockWindow('http://localhost:3000', 'Firefox');

        expect(manager.isLocalhostSubdomainSupported()).toBe(false);
      });
    });

    describe('getLocalhostSubdomainCanisterURL', () => {
      it('should return correct localhost subdomain URL using replicaPort', () => {
        const mockCanisterId = 'test-canister-id';
        const url = manager.getLocalhostSubdomainCanisterURL(mockCanisterId);
        expect(url).toBe(
          `http://${mockCanisterId}.localhost:${mockConfig.replicaPort}`,
        );
      });
    });
  });
});
