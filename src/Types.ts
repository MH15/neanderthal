
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


export enum RenderTypes {
    Copy = 1,
    Render = 2,

}