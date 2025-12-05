import { Home , Activity , Settings , Rocket } from 'lucide-react';
import {v4 as uuid} from 'uuid';

type FieldProps={
    label : string,
    id: string,

}

type SideBarProps = {
    icon: React.ReactNode
} & FieldProps

export const SIDEBAR_MENU: SideBarProps[]=[
    {
        id: uuid(),
        label:'home',
        icon:<Home color='#ffffff'/>
    },
    {
        id: uuid(),
        label:'automations',
        icon:< Activity color='#ffffff'/>
    },
    {
        id: uuid(),
        label:'integrations',
        icon:<Rocket color='#ffffff'/>
    }, 
    {
        id: uuid(),
        label:'settings',
        icon:<Settings color='#ffffff'/>
    },
]

