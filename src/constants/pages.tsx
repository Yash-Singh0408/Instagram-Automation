import { Activity, Contact, Home, Rocket, Settings } from "lucide-react"

export const PAGES_BREAD_CRUMBS : string[] = [
    "contacts",
    "automations",
    "integrations",
    "settings"
]

type Props = {
    [page in string]:React.ReactNode
}

export const PAGES_ICON : Props = {
    AUTOMATIONS: <Activity color='#ffffff'/>,
    CONTACTS : <Contact color='#ffffff'/>,
    INTEGRATIONS: <Rocket color='#ffffff'/>,
    SETTINGS: <Settings color='#ffffff'/>,
    HOME: <Home color='#ffffff'/>
}