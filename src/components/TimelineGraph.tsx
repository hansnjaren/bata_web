import { defaultDurationMultiplier } from "../constants/skills";

export default function TimelineGraph({
    attackItems, 
    buffItems, 
    checkedUE2
}: {
    attackItems: AttackSkill[];
    buffItems: BuffSkill[];
    checkedUE2: Record<string, boolean>;
}
) {
    return (
        <div>
            <h3>공격 타임라인 (스킬 단위)</h3>
            {attackItems.map((item, i) => (
                <div key={i} style={{ marginBottom: "14px" }}>
                <b>캐릭터:</b> {item.character} <b>타입:</b> {item.detail}
                <br />
                <span>스킬 실행 시간: {item.startTime.toFixed(3)}초</span>
                <br />
                <span>
                    모든 타수 시점:{" "}
                    {item.allDelays
                    .map((d) => (item.startTime + d).toFixed(3))
                    .join(", ")}
                    초
                </span>
                </div>
            ))}

            <h3>버프 타임라인</h3>
            {buffItems.map((item, i) => {
                const isChecked = item.UE2 && checkedUE2[item.character];
                const duration =
                item.duration * (isChecked ? defaultDurationMultiplier : 1);

                return (
                <div key={i}>
                    [buff] 시간: {item.time.toFixed(3)}초, 캐릭터: {item.character},
                    스킬 종류: {item.detail}, 지속시간: {duration.toFixed(2)}초
                </div>
                );
            })}

        </div>
    );
}