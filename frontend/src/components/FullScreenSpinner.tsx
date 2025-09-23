interface FullScreenSpinnerProps{
    content:string
}
export const FullScreenSpinner = ({content}:FullScreenSpinnerProps) =>(

    <div className="flex justify-center items-center h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
            <p className="text-muted-foreground">{content}...</p>
        </div>
    </div>
)