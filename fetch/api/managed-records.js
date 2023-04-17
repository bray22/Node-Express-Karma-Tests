import URI from "urijs";
import { ITEMS_PER_PAGE, PRIMARY_COLORS } from "../constants/managed-records-constants";

// records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const retrieve = async (options = {}) => {
  const page = options.page || 1;
  const colors = options.colors || [];

  // build queryParams
  const queryParams = {
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
    color: colors.length ? colors : undefined
  };

  // build URL for fetch
  const URL = URI(window.path).search({
    "limit": queryParams.limit,
    "offset": queryParams.offset,
    "color[]": queryParams.color
  });

  // asyncronously call fetch
  const response = await fetch(URL);

  // report api failure
  if (!response.ok) {
    console.log(`API request failed with status ${response.status}`);
    return null;
  }

  // on api success, create items
  const items = await response.json();

  const transformData = (items) => {
    const ids = items.map((item) => item.id);
    
    // filter items to identify open
    const open = items
      .filter((item) => item.disposition === "open")
      .map((item) => ({
        ...item,
        isPrimary: PRIMARY_COLORS.includes(item.color),
      }));

    // get count of closed primary
    const closedPrimaryCount = items.filter(
      (item) => item.disposition === "closed" 
        && PRIMARY_COLORS.includes(item.color)).length;

    // don't show prev page on page 1
    const previousPage = page > 1 ? page - 1 : null;
    
    // only show nextPage if not last page and items matches items_per_page
    const nextPage = items.length === ITEMS_PER_PAGE 
      && page < 50 ? page + 1 : null;

    // return new object
    return {
      ids,
      open,
      closedPrimaryCount,
      previousPage,
      nextPage,
    };
  };

  // return transformed data
  return transformData(items);
};

export default retrieve;


