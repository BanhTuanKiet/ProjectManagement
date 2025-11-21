export interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export interface MembersSelection {
    id: string
    name: string
}