import React from 'react';
import { Search, Moon, Inbox, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Topbar = ({ title }) => {
    const { toggleTheme } = useTheme();

    return (
        <header className="topbar">
            <div className="tb-left">
                <h2 className="page-title">{title}</h2>
                <div className="search-container">
                    <Search />
                    <input type="text" placeholder="Global Search (Ctrl+K)..." />
                </div>
            </div>

            <div className="tb-right">
                <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                    <Moon />
                </button>
                <button className="icon-btn">
                    <Inbox />
                </button>
                <button className="icon-btn">
                    <Bell />
                    <span className="icon-badge">5</span>
                </button>
            </div>
        </header>
    );
};

export default Topbar;
