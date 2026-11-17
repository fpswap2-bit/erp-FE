import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import AppRouter from "./routes/AppRouter";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
{/*import { SmokeyBackground } from "./components/ui/SmokeyBackground";*/}
function App() {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return(
        <TooltipProvider>
        <BrowserRouter>
        <div className="relative flex min-h-screen flex-col bg-amber-100">
        {/*<SmokeyBackground color="#0a3253" backdropBlurAmount="sm" className="z-0" />*/}
        <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full flex-1 px-4 py-6">
            <AppRouter />
            </main>
            <Footer />
            </div>
            </div>
        </BrowserRouter>
        </TooltipProvider>
    );
}

export default App;