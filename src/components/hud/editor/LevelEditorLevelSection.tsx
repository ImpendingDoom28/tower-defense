import { useEnemyTypeOptions } from "../../../core/hooks/useEnemyTypeOptions";
import { tileSizeSelector, useGameStore } from "../../../core/stores/useGameStore";
import { useLevelEditorStore } from "../../../core/stores/useLevelEditorStore";
import {
  parseFiniteNumberFromEvent,
  parseNumberInputOr,
} from "../../../utils/parseNumberInput";
import {
  UIAccordionContent,
  UIAccordionItem,
  UIAccordionTrigger,
} from "../../ui/UIAccordion";
import { UIInput } from "../../ui/UIInput";

import { EditorColorField } from "./EditorColorField";
import { EditorField } from "./EditorField";

export const LevelEditorLevelSection = () => {
  const tileSize = useGameStore(tileSizeSelector);
  const enemyTypeOptions = useEnemyTypeOptions();
  const {
    draftLevel,
    setLevelName,
    setStartingMoney,
    setGridSize,
    setEnemyWeight,
    setTileColor,
    setGroundColor,
  } = useLevelEditorStore();

  return (
    <UIAccordionItem value="level">
      <UIAccordionTrigger>Level</UIAccordionTrigger>
      <UIAccordionContent className="flex flex-col gap-3">
        <EditorField label="Name" description="Used in the exported filename.">
          <UIInput
            value={draftLevel.name}
            onChange={(event) => setLevelName(event.target.value)}
            placeholder="custom"
          />
        </EditorField>

        <EditorField label="Starting Money">
          <UIInput
            type="number"
            value={draftLevel.startingMoney}
            onChange={(event) =>
              setStartingMoney(parseNumberInputOr(event, 0))
            }
          />
        </EditorField>

        <EditorField label="Grid Size">
          <UIInput
            type="number"
            min={5}
            value={draftLevel.gridSize}
            onChange={(event) =>
              setGridSize(
                parseNumberInputOr(event, draftLevel.gridSize),
                tileSize
              )
            }
          />
        </EditorField>

        <div className="grid grid-cols-2 gap-2">
          <EditorField label="Tile Color">
            <EditorColorField
              value={draftLevel.tileColor}
              defaultToken="editor-default-tile"
              onChange={setTileColor}
            />
          </EditorField>
          <EditorField label="Ground Color">
            <EditorColorField
              value={draftLevel.groundColor}
              defaultToken="editor-default-ground"
              onChange={setGroundColor}
            />
          </EditorField>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {enemyTypeOptions.map((enemyType) => (
            <EditorField key={enemyType} label={`${enemyType}`}>
              <UIInput
                type="number"
                min={0}
                value={draftLevel.enemyWeights?.[enemyType] ?? 0}
                onChange={(event) =>
                  setEnemyWeight(
                    enemyType,
                    parseFiniteNumberFromEvent(event, 0)
                  )
                }
              />
            </EditorField>
          ))}
        </div>
      </UIAccordionContent>
    </UIAccordionItem>
  );
};
