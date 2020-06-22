export default interface IResource {
    path: string
    body: string
    load(): Promise<IResource>
    render(data): string
    write(path): void
}