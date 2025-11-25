import { useEffect, useRef, useState } from "react";

/**
 * Hook to preload critical resources for better performance
 */
export const usePreloadCriticalResources = (resources = []) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const preloadedResources = useRef(new Set());

  useEffect(() => {
    if (!resources.length) return;

    const preloadResource = (resource) => {
      if (preloadedResources.current.has(resource.href)) return;

      const link = document.createElement("link");
      link.rel = resource.type === "font" ? "preload" : "prefetch";
      link.href = resource.href;

      if (resource.type === "font") {
        link.as = "font";
        link.type = resource.format || "font/woff2";
        link.crossOrigin = "anonymous";
      } else if (resource.type === "image") {
        link.as = "image";
      }

      link.onload = () => {
        preloadedResources.current.add(resource.href);
        setLoadedCount((prev) => prev + 1);
      };

      document.head.appendChild(link);
    };

    resources.forEach(preloadResource);

    return () => {
      // Cleanup would be complex, so we'll keep preloaded resources
    };
  }, [resources]);

  return {
    isLoading: loadedCount < resources.length,
    loadedCount,
    totalCount: resources.length,
  };
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Hook for intersection observer with performance optimizations
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!targetRef.current) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "50px",
      ...options,
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting;
      setIsIntersecting(isVisible);

      if (isVisible && !hasIntersected) {
        setHasIntersected(true);
      }
    }, observerOptions);

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

/**
 * Hook for lazy loading images with performance optimizations
 */
export const useLazyImage = (src, placeholder = null) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (hasIntersected && src && !isLoaded) {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };

      img.onerror = () => {
        setIsError(true);
      };

      img.src = src;
    }
  }, [hasIntersected, src, isLoaded]);

  return {
    ref: targetRef,
    src: imageSrc,
    isLoaded,
    isError,
  };
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  // Measure component render time
  measureRender: (componentName) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    };
  },

  // Get memory usage (if available)
  getMemoryUsage: () => {
    if ("memory" in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  },

  // Critical CSS injection
  injectCriticalCSS: (css) => {
    const style = document.createElement("style");
    style.textContent = css;
    style.setAttribute("data-critical", "true");
    document.head.insertBefore(style, document.head.firstChild);
  },
};

/**
 * Hook for managing component mounting performance
 */
export const usePerformantMount = (callback) => {
  const mountedRef = useRef(false);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;

      // Use requestIdleCallback if available, otherwise setTimeout
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => {
          if (mountedRef.current) {
            callbackRef.current();
          }
        });
      } else {
        setTimeout(() => {
          if (mountedRef.current) {
            callbackRef.current();
          }
        }, 0);
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef.current;
};
