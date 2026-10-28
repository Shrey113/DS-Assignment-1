import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplet, Home, Heart, ArrowLeftRight, ChevronDown, MapPin, Building2 } from 'lucide-react';

export default function PortalHeader({ pageTitle, breadcrumbs }) {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine current active page name for breadcrumb
  const currentPath = location.pathname;
  const pageName = pageTitle || (
    currentPath === '/donor' ? 'Donor' :
    currentPath === '/requester' ? 'Requester' :
    currentPath === '/our-area' ? 'Our Area' :
    currentPath.startsWith('/blood-banks') ? 'Blood Banks' : 'Portal'
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown options based on current route
  const getDropdownLinks = () => {
    const allLinks = [
      { to: '/', label: 'Home', icon: Home },
      { to: '/our-area', label: 'Our Area (Map)', icon: MapPin, color: '#EF4E4E' },
      { to: '/blood-banks', label: 'Blood Banks', icon: Building2, color: '#EF4E4E' },
      { to: '/donor', label: 'Donor Portal', icon: Heart, color: '#EF4E4E' },
      { to: '/requester', label: 'Requester Portal', icon: Droplet, color: '#EF4E4E' }
    ];
    return allLinks.filter(item => item.to !== currentPath);
  };

  const links = getDropdownLinks();

  return (
    <header className="portal-header">
      {/* Left: {Logo} BloodLink / Breadcrumbs */}
      <div className="portal-header-left">
        <Link to="/" className="editorial-logo">
          <img src="/bloodlink_logo.png" alt="BloodLink logo" className="editorial-logo-img" />
          <div className="logo-monogram">Blood<span>Link</span></div>
        </Link>

        {breadcrumbs && breadcrumbs.length > 0 ? (
          breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="portal-breadcrumb-sep">/</span>
              {crumb.to ? (
                <Link to={crumb.to} className="portal-breadcrumb-link">
                  {crumb.label}
                </Link>
              ) : (
                <span className="portal-breadcrumb-page">{crumb.label}</span>
              )}
            </React.Fragment>
          ))
        ) : (
          <>
            <span className="portal-breadcrumb-sep">/</span>
            <span className="portal-breadcrumb-page">{pageName}</span>
          </>
        )}
      </div>

      {/* Right: Switch Portal Button with Dropdown */}
      <div className="portal-header-right" ref={dropdownRef}>
        <button
          type="button"
          className={`portal-switch-trigger ${isDropdownOpen ? 'active' : ''}`}
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          aria-expanded={isDropdownOpen}
          aria-label="Switch portal navigation"
        >
          <ArrowLeftRight size={15} />
          <span>Switch</span>
          <ChevronDown size={13} className={`switch-caret ${isDropdownOpen ? 'open' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="portal-switch-dropdown">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="portal-dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Icon size={15} color={link.color || 'var(--text-secondary)'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
