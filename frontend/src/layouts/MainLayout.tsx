import React from 'react';
import { Outlet, Link } from 'react-router';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="navbar bg-base-100 shadow-md">
                <div className="flex-1">
                    <Link to="/" className="btn btn-ghost normal-case text-xl">
                        Hook Relay
                    </Link>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                    </ul>
                </div>
            </header>
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="footer items-center p-4 bg-neutral text-neutral-content">
                <div className="items-center grid-flow-col">
                    <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
