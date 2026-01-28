/**
 * Represents a paginated response structure.
 *
 * @template T The type of the items being paginated.
 * @property items The array of items for the current page.
 * @property links An object containing pagination navigation links.
 * @property links.first The URL to the first page, if available.
 * @property links.previous The URL to the previous page, if available.
 * @property links.current The URL to the current page.
 * @property links.next The URL to the next page, if available.
 * @property links.last The URL to the last page, if available.
 */
export interface IPaginated<T> {
  items: T[];
  links: {
    first?: string | null;
    previous?: string | null;
    current: string | null;
    next?: string | null;
    last?: string | null;
  };
}
