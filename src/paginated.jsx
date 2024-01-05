import { useQuery, keepPreviousData } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useSearchParams } from "react-router-dom";
// Fetch categories data from API
// Use react-query to cache data

// Fetch products data from API
// Use query params for filtering, pagination
// Use react-query features like keepPreviousData, staleTime

// Update query params on pagination

function Products() {
  const [searchParams, setSearchParams] = useSearchParams({
    skip: 0,
    limit: 4,
  });
  // finding query strings by serachPrarams
  const skip = parseInt(searchParams.get("skip") || 0);
  const limit = parseInt(searchParams.get("limit") || 0);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // array of strings
      return await fetch("https://dummyjson.com/products/categories").then(
        (res) =>
          // Parses the JSON response from the fetch request
          // and returns the JSON data
          res.json()
      );
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products", limit, skip, q, category], // ! always add query parmertes in querykey while filteration
    queryFn: async () => {
      let url = `https://dummyjson.com/products/search?limit=${limit}&skip=${skip}&q=${q}`;
      if (category) {
        url = `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${skip}`;
      }
      return await fetch(url).then((res) => res.json());
    },
    placeholderData: keepPreviousData,
    staleTime: 20000,// 20 seconds statleTime: means fresh data will not be fetched for 20 seconds
  });

  const handleMove = (moveCount) => {
    // Next
    // skip = 4, moveCount = 4
    // 4 + 4 = 8

    // Prev
    // skip = 0, moveCount = -4
    // 0 + -4 = -4

    setSearchParams((prev) => {
      prev.set("skip", Math.max(skip + moveCount, 0));
      return prev;
    });
  };

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              My store
            </h2>
          </div>
          <div>
            <div className="relative mt-2 rounded-md flex items-center gap-8 mb-4">
              <input
                onChange={debounce((e) => {
                  setSearchParams((prev) => {
                    prev.set("q", e.target.value);
                    prev.set("skip", 0);
                    prev.delete("category");
                    return prev;
                  });
                }, 1000)}
                type="text"
                name="price"
                id="price"
                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="IPhone"
              />
              <select
                className="border p-2"
                onChange={(e) => {
                  setSearchParams((prev) => {
                    prev.set("skip", 0);
                    prev.delete("q");
                    prev.set("category", e.target.value);
                    return prev;
                  });
                }}
              >
                <option>Select category</option>
                {categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {/*products?.products?.map      optional chaining  */}
            {products?.products?.map((product) => (
              <div key={product.id} className="group relative">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-64">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <a href="">
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.title}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.category}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-12">
            <button
              disabled={skip < limit}
              className="bg-purple-500 px-4 py-1 text-white rounded"
              onClick={() => {
                handleMove(-limit);
              }}
            >
              Prev
            </button>
            //* tricky- next button disable code
            <button
              disabled={limit + skip >= products?.total}
              className="bg-purple-500 px-4 py-1 text-white rounded"
              onClick={() => {
                handleMove(limit);
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Products;

/**
 useParams - for path route parameters
useSearchParams - for query string parameters
useParams is synchronous while useSearchParams allows you to imperatively update the search string. 



useParams allows you to access route parameters in a URL path like /users/:id. useSearchParams allows accessing the query string ?foo=bar.

useParams returns an object of key/value pairs for dynamic params. useSearchParams returns an array with search params that can be iterated.

useParams gives you access to params that were defined in the route path. useSearchParams gives access to the query string.

useParams is updated when a component mounts and on route changes. useSearchParams is updated on mount and when search params change.

To update params with useParams you need to navigate to a new route. With useSearchParams you can imperatively update the search string*/


/**Lodash's debounce function is used to limit how often a function can be called. It is helpful for things like:

Rate limiting API calls or other expensive operations
Implementing search as you type, so the search doesn't fire on every keystroke
Waiting for a user to stop resizing a window before doing something 


Here is how it works:

You wrap a function call in _.debounce() and pass it a delay time in milliseconds. This will make it so the original function is only actually called if that many ms have passed since it was last called.

For example:

const search = _.debounce(doExpensiveSearch, 300); 

// The user types 'a' 
search('a');

// The user types 'b' a millisecond later
search('ab'); 

// 298ms pass without another call

// The user types 'c' 
search('abc');

// At this point, 300ms have passed since the initial 'a' call, so doExpensiveSearch('abc') actually runs. The 'b' call was ignored since not enough time passed.



This allows us to limit a function to only run after the user has stopped typing for a certain amount of time. The delay also "resets" after each cal*/