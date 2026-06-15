/**
 * pages.config.js - Page routing configuration
 * Uses React.lazy() for code splitting.
 */

import React from "react";

const Analytics = React.lazy(() => import('./pages/Analytics'));
const Create = React.lazy(() => import('./pages/Create'));
const Credits = React.lazy(() => import('./pages/Credits'));
const Explore = React.lazy(() => import('./pages/Explore'));
const Home = React.lazy(() => import('./pages/Home'));
const Library = React.lazy(() => import('./pages/Library'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const StyleDNA = React.lazy(() => import('./pages/StyleDNA'));
const VideoSync = React.lazy(() => import('./pages/VideoSync'));
import __Layout from './Layout.jsx';

export const PAGES = {
    "Analytics": Analytics,
    "Create": Create,
    "Credits": Credits,
    "Explore": Explore,
    "Home": Home,
    "Library": Library,
    "Marketplace": Marketplace,
    "StyleDNA": StyleDNA,
    "VideoSync": VideoSync,
}

export const pagesConfig = {
    mainPage: "Create",
    Pages: PAGES,
    Layout: __Layout,
};