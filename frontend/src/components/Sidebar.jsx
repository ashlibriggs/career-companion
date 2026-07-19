import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: 'Today', icon: '🌿', path: '/' },
  { label: 'Opportunities', icon: '💼', path: '/opportunities' },
  { label: 'Tracker', icon: '📌', path: '/tracker' },
  { label: 'Resume', icon: '📄', path: '/resume' },
  { label: 'Action Plan', icon: '🌱', path: '/action-plan' },
  { label: 'Profile', icon: '👤', path: '/profile' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span aria-hidden="true">🌿</span>
        <span>Career Companion</span>
      </div>

      <nav aria-label="Primary navigation">
        <ul className="sidebar__navigation">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  isActive
                    ? 'sidebar__link sidebar__link--active'
                    : 'sidebar__link'
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar