export class ASPNetGenerator {
  public generateASPNet(controllerName: string): string {
    return `using Microsoft.AspNetCore.Mvc;\n\nnamespace App.Controllers\n{\n    [ApiController]\n    [Route("[controller]")]\n    public class ${controllerName}Controller : ControllerBase\n    {\n        [HttpGet]\n        public IActionResult Get() => Ok();\n    }\n}\n`;
  }
}
