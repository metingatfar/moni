export class RustActixGenerator {
  public generateRustActix(routeName: string): string {
    return `use actix_web::{get, Responder, HttpResponse};\n\n#[get("/${routeName.toLowerCase()}")]\npub async fn ${routeName.toLowerCase()}_route() -> impl Responder {\n    HttpResponse::Ok().body("Rust Actix route")\n}\n`;
  }
}
