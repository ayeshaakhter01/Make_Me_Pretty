import { useEffect } from "react";
const SITE_TITLE = "Make Me Pretty \u2014 Premium Skincare, Made for Bangladesh";
const SUFFIX = " \xB7 Make Me Pretty";
function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title}${SUFFIX}` : SITE_TITLE;
  }, [title]);
}
export {
  SITE_TITLE,
  useTitle
};
