export class GoFiberGenerator {
  public generateGoFiber(routerName: string): string {
    return `package main\n\nimport "github.com/gofiber/fiber/v2"\n\nfunc Setup${routerName}Routes(app *fiber.App) {\n\tapp.Get("/${routerName.toLowerCase()}", func(c *fiber.Ctx) error {\n\t\treturn c.SendString("${routerName} Fiber View")\n\t})\n}\n`;
  }
}
