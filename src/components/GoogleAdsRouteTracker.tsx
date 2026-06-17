import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackGoogleAdsPageView } from "../utils/googleAds";

export default function GoogleAdsRouteTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackGoogleAdsPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}
