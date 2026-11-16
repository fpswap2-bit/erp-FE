export default function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-white/70 ">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm text-neutral-500">
                <span>Surabhi Institute</span>          
                <span>© {new Date().getFullYear()} Surabhi Institute. All rights reserved.</span>            
                </div>
        </footer>
    );
}