
export interface BlogPost extends Page {
    title: string,
    date_published: string,
    authors: Author[],
    tags: string[]

}

export interface Page {
    html: string,
    slug: string
}

export interface Author {

}

export interface FrontMatter {
    title: string
    date_published: string
    authors?: string[]
    tags?: string[]
    draft?: boolean
    [key: string]: any
}


export enum RenderTypes {
    Copy = 1,  // Copy files without changing
    Render,    // Render files from template
    Generated, // Generate a list of user files  
}