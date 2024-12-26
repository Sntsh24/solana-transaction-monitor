import * as React from "react"
 
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
      {...props}
    />
  )
}

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="flex flex-col space-y-1.5 pb-4"
      {...props}
    />
  )
}

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className="font-semibold leading-none tracking-tight"
      {...props}
    />
  )
}

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className="pt-0"
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardContent }