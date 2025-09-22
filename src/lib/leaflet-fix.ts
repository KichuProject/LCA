// Fix for Leaflet marker icons in production builds
import L from 'leaflet';

// Fix the default icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="50" height="82" viewBox="0 0 50 82" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 0C11.2 0 0 11.2 0 25c0 25 25 57 25 57s25-32 25-57C50 11.2 38.8 0 25 0z" fill="#3388ff"/>
      <circle cx="25" cy="25" r="10" fill="#fff"/>
    </svg>
  `),
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#3388ff"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
    </svg>
  `),
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="41" height="41" viewBox="0 0 41 41" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20.5" cy="37" rx="20" ry="4" fill="#000" opacity="0.2"/>
    </svg>
  `),
});

export default L;