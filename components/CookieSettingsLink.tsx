"use client";

export function CookieSettingsLink() {
  function reset() {
    window.dispatchEvent(new Event("show-cookie-settings"));
  }

  return (
    <button
      onClick={reset}
      className="hover:text-blue-700 text-left focus:outline-none focus:underline"
    >
      Cookieinställningar
    </button>
  );
}
