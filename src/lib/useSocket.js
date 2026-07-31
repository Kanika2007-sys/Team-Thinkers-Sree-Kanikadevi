/**
 * Legacy socket hook replaced with Xano Service persistent event sync.
 */
export function useSocket() {
  return { socket: null, isConnected: true };
}

export default useSocket;
