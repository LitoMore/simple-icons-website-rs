import type { Page, Download, TestType } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'url';
import * as simpleicons from 'simple-icons';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const OUTPUT_DIR = 'test-results/';
const ROOT_DIR = path.resolve(__dirname, '../../');

// Number of icons in simple-icons library
export const N_ICONS = Object.keys(simpleicons).length;

// Directory path of simple-icons npm package
export const SIMPLE_ICONS_DIRPATH = path.resolve(
  ROOT_DIR,
  'node_modules/simple-icons',
);

// App configuration file path
const RUST_CONFIG_FILEPATH = path.resolve(ROOT_DIR, 'config/src/lib.rs');

/**
 * Get the number of icons per page from app configuration.
 *
 * @returns Number of icons per page from the Rust config file
 */
export const getNumberOfIconsPerPageConfig = (): number => {
  const config = fs.readFileSync(RUST_CONFIG_FILEPATH, 'utf8');
  const match = config.match(/icons_per_page: (\d+)/);
  if (!match) {
    throw new Error('Could not get number of icons per page from config');
  }
  return parseInt(match[1], 10);
};

export const N_ICONS_PER_PAGE = getNumberOfIconsPerPageConfig();

const getViewportSize = (page: Page): { width: number; height: number } => {
  const size = page.viewportSize();
  if (!size) {
    throw new Error('Viewport size is not set');
  }
  return size;
};

/**
 * Get if the viewport of a page is at least the given breakpoint.
 *
 * @param br TailwindCSS breakpoint
 * @param page Playwright page
 * @returns Whether the viewport is at least the given breakpoint
 */
export const screenWidthIsAtLeast = (
  br: 'xs' | 'sm' | 'md' | 'lg',
  page: Page,
): boolean => {
  const size = getViewportSize(page);

  switch (br) {
    case 'xs':
      return size.width >= 475;
    case 'sm':
      return size.width >= 640;
    case 'md':
      return size.width >= 768;
    case 'lg':
      return size.width >= 1024;
    default:
      return false;
  }
};

/**
 * Selectors used in the end-to-end tests.
 */
export const selectors = {
  /**
   * Selector for the body.
   * Using `:last-child` because Trunk injectes their own body on development.
   */
  body: 'body:last-child',
  header: {
    container: 'header',
    title: 'h1',
    description: 'header > :first-child > p',
    nav: {
      container: 'header > nav',
      toggler: 'header > nav > ul:last-child',
      buttons: {
        container: 'header > nav > ul:first-child',
        languageSelector: 'header > nav > ul:first-child > li:last-of-type',
      },
    },
  },
  /* Selectors for controls in main menu */
  controls: {
    toggler: 'menu > :last-child button',
    /* Buttons controls, don't include the search one */
    buttons: {
      /* Get a control by its position in the menu */
      getByNthChild: (n: number) =>
        `menu > .controls-group:not(:first-child) > .control:nth-child(${n})`,
    },
    search: {
      input: 'menu > .controls-group:first-child input',
    },
  },
  /* Selectors for the grid */
  grid: (() => {
    const gridSelector = 'main > ul';
    const gridItemsSelector = `${gridSelector} > li`;
    const getGridItemByNthChild = (n: number) =>
      `${gridItemsSelector}:nth-child(${n})`;

    const buildGridItemSelectors = (
      containerSelector: string | Function,
    ): Record<'container' | 'icon', any> => {
      return {
        container: containerSelector,
        /* Selectors for grid icon items */
        icon: {
          preview: `${containerSelector} > :first-child img`,
          title: `${containerSelector} h2`,
          footer: {
            downloadButton: `${containerSelector} > :last-child > :last-child`,
          },
        },
      };
    };

    return {
      /* Grid selector */
      container: gridSelector,
      /* Grid items selector */
      items: gridItemsSelector,
      item: {
        /* Get selector for first item in the grid */
        first: buildGridItemSelectors(getGridItemByNthChild(1)),
        /* Get selector for a random grid item */
        any: buildGridItemSelectors(
          getGridItemByNthChild(
            Math.floor(Math.random() * (N_ICONS_PER_PAGE - 1 + 1) + 1),
          ),
        ),
      },
      /* Button to go to footer which stops loading more icons */
      scrollToFooter: '.scroll-to-footer-button',
      /* Button to go to header from footer */
      scrollToHeader: '.scroll-to-header-button',
      /* Button to load more icons */
      loadMoreIcons: '.load-more-icons button',
    };
  })(),
  footer: 'footer',
  /* Selectors for modals */
  modals: {
    languageSelector: '.language-selector',
  },
};

/**
 * Save a playwright download in the output directory.
 *
 * @param download Playwright download
 * @param filename Filename of the download
 * @returns Path to the saved file
 */
export const saveDownload = async (
  download: Download,
  filename: string,
): Promise<string> => {
  const outputPath = path.resolve(OUTPUT_DIR, filename);
  await download.saveAs(outputPath);
  return outputPath;
};

/**
 * Get icons titles from the grid.
 * @param page Playwright page
 * @returns Icons titles shown in the grid
 */
export const getGridItemsIconsTitles = async (
  page: Page,
): Promise<Array<string>> => {
  return Promise.all(
    (await page.locator(`${selectors.grid.items} h2`).all()).map(
      async ($iconTitle) => await $iconTitle.textContent(),
    ),
  );
};

/**
 * Helper to set local storage on `test.use` with Playwright.
 */
export const useLocalStorage = (
  test: TestType<any, any>,
  storage: Record<string, string>,
) => {
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: '',
          localStorage: Object.keys(storage).map((k) => ({
            name: k,
            value: storage[k],
          })),
        },
      ],
    },
  });
};

// TODO: Use the utils file from simple-icons package, which comes with Typescript support
// (needs https://github.com/simple-icons/simple-icons/pull/8077 merged and released)
/**
 * Get the data of the simple-icons package.
 *
 * @returns Simple Icons data
 */
export const getSimpleIconsData = (): Array<any> => {
  const dataFilepath = path.resolve(
    SIMPLE_ICONS_DIRPATH,
    '_data/simple-icons.json',
  );
  return JSON.parse(fs.readFileSync(dataFilepath, 'utf8')).icons;
};
