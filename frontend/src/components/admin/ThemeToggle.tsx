import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "../ui"
import { toggleTheme } from "@/store/slices/appSlice";
import { Moon, Sun } from "lucide-react";


const ThemeToggle = ({ className = '' }: { className?: string }) => {

    const dispatch = useAppDispatch();
    const isDark = useAppSelector((state) => state.app.theme === "dark");

    return <div className={className}>
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            className="rounded-xl border border-indigo-100 bg-white p-2 text-slate-600 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    </div>
}

export default ThemeToggle