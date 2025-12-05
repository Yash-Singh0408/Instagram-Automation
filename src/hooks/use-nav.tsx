import { usePathname } from "next/navigation"

export const usePaths = () => {
    const pathname = usePathname();   // Get the current pathname
    const path = pathname.split("/")  // Split the path into segments
    let page = path[path.length - 1]  // Get the last segment of the path
    return { pathname, page }
}