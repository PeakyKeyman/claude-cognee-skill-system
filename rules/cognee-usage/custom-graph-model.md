# Cognee Custom Graph Model Contract

**Trigger:** Using `graph_model_file` + `graph_model_name` for typed extraction, OR debugging "21 validation errors for DocumentChunk" Pydantic errors.

## Contract (codified 2026-05-31)

When using `graph_model_file` + `graph_model_name` for typed extraction:

- The named class **must inherit from `cognee.modules.engine.models.Entity`** — not just `pydantic.BaseModel`, not just `DataPoint`. Entity extends DataPoint extends BaseModel.
- Entity has REQUIRED `name: str` and `description: str` fields. Map your domain concepts onto these.
- The Neo4j node label auto-derives from the class name (via `DataPoint.__init__: self.type = self.__class__.__name__`). So `Lesson(Entity)` writes `:Lesson` nodes.
- Cross-references between custom types work as long as BOTH sides inherit Entity.
- Self-references via string annotation + `model_rebuild()` at end of file.

## Why required

`cognee/tasks/graph/extract_graph_from_data.py:104-108` assigns the LLM-extracted object directly to `DocumentChunk.contains`, which is typed `List[Union[Entity, Event, tuple[Edge, Entity]]]`. A BaseModel or generic DataPoint fails this Union match — Pydantic produces `21 validation errors for DocumentChunk` with tuples like `('field_name', value)` where Entity is expected.

## Canonical ontology pattern

`~/.claude/cognee-custom/nua_ontology.py` is the working example.

See `feedback_cognee_entity_inheritance.md` in project memory for full diagnosis + field-mapping rules per entity type.
