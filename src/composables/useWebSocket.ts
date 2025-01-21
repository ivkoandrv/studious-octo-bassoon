import { onMounted, onUnmounted, type Ref, ref } from "vue";
import type { IButton, IWSSMessage } from "@/types/modules/MockDatabase.ts";
import { debounce } from "lodash";

/**
 * 16 ms = 60 FPS. (0.0165 second).
 * 1 frame / (0.0165 second) = 60 fps.
 *
 * Your monitor has a default rate at which it refreshes the screen (typically 60 Hz).
 *
 * 30 FPS = 33.33
 * 60 FPS = 16.66
 * 90 FPS = 11.11
 * 120 FPS = 8.33
 * 140 FPS = 7.14
 * 144 FPS = 6.94
 * 180 FPS = 5.55
 * 240 FPS = 4.16
 */
const FRAME_VELOCITY_MS = 16;

/**
 *
 * My solution try to solve the problem of unnecessary re-rendering and animations.
 *
 * The pseudocode included in the task has several performance issues.
 * The problem was in multiple updates. Specifically, each message from
 * the websocket caused an immediate state update.
 *
 * This led to N re-renders and N animations occurring when receiving N messages.
 *
 * Results:
 * Before: N messages -> N updates -> N renders -> N animations
 * After: N messages -> 1 update -> 1 render -> 1 animation
 *
 * How I achieve that?
 * 1. Batching updates
 * 2. Debounce processing
 * 3. Using only the last state
 * 5. Optimization for the collapsed/hidden browser tab/window.
 */

export function useWebSocket(wsUrl: string) {
  const buttons: Ref<IButton[]> = ref([]);
  let ws: WebSocket | null = null;
  let pendingUpdates: IButton[][] = []; // Queue for the updates
  let isProcessingUpdates = false; // Processing flag

  /**
   * Debouncing
   *
   * If many updates arrive in a short period of time, they will be stored in a queue.
   * Function processUpdates call only once from the last update
   *
   */
  const processUpdates = debounce(() => {
    if (pendingUpdates.length === 0 || isProcessingUpdates) return;

    isProcessingUpdates = true;

    // Get and apply only the latest update from the queue
    buttons.value = pendingUpdates[pendingUpdates.length - 1];

    // let's clear queue
    pendingUpdates = [];
    isProcessingUpdates = false;
  }, FRAME_VELOCITY_MS);

  /**
   * This function is for handling messages
   */
  const handleMessage = (event: MessageEvent) => {
    try {
      const message: IWSSMessage = JSON.parse(event.data);
      pendingUpdates.push(message.buttons); // add message to the queue
      processUpdates(); // start processing
    } catch (err) {
      console.error("Error processing WS message", err);
    }
  };

  /**
   * Init WebSockets
   */
  const wsInit = () => {
    ws = new WebSocket(wsUrl);
    ws.addEventListener("message", handleMessage);

    ws.addEventListener("close", () => {
      setTimeout(wsInit, 1000);
    });
  };

  onMounted(() => {
    wsInit();

    /**
     *  Here is an optimization for the collapsed/hidden tab/window
     *
     *  When the page is hidden while update is still coming - they are stored in the queue
     *  If I want to show see the page this script applies only the last update
     *
     *  Why? I need to avoid animations cascade
     */
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && pendingUpdates.length > 0) {
        processUpdates();
      }
    });
  });

  onUnmounted(() => {
    if (ws) {
      ws.close();
    }
    processUpdates.cancel();
  });

  return { buttons };
}
