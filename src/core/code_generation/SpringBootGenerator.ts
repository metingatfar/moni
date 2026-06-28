export class SpringBootGenerator {
  public generateSpringBoot(controllerName: string): string {
    return `import org.springframework.web.bind.annotation.*;\n\n@RestController\n@RequestMapping("/${controllerName.toLowerCase()}")\npublic class ${controllerName}Controller {\n    @GetMapping\n    public String get() {\n        return "Spring Boot Response";\n    }\n}\n`;
  }
}
