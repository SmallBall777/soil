function toggleInputs() {
    let method = document.getElementById("method").value;
    document.getElementById("method1_inputs").style.display = method === "1" ? "block" : "none";
    document.getElementById("method2_inputs").style.display = method === "2" ? "block" : "none";
}

function updateMaterialInputs() {
    try {
        let use_kuto_tankar = document.getElementById("use_kuto_tankar").checked;
        let use_magnesium_hydroxide = document.getElementById("use_magnesium_hydroxide").checked;

        console.log("updateMaterialInputs called: ", { use_kuto_tankar, use_magnesium_hydroxide });

        document.getElementById("kuto_tankar_inputs").style.display = use_kuto_tankar ? "block" : "none";
        document.getElementById("magnesium_hydroxide_inputs").style.display = use_magnesium_hydroxide ? "block" : "none";
    } catch (error) {
        console.error("updateMaterialInputs エラー:", error);
    }
}

let customMaterialCount = 0;

function addCustomMaterial() {
    try {
        console.log("addCustomMaterial called");
        customMaterialCount++;
        let container = document.getElementById("custom_materials_container");
        let customMaterialDiv = document.createElement("div");
        customMaterialDiv.id = `custom_material_${customMaterialCount}`;
        customMaterialDiv.innerHTML = `
            <h4>カスタム改良材 ${customMaterialCount}</h4>
            <input type="text" id="custom_material_name_${customMaterialCount}" placeholder="カスタム改良材の名称"><br>
            <input type="number" id="custom_material_alkali_${customMaterialCount}" placeholder="カスタム アルカリ分 (%)"><br>
            <input type="number" id="custom_material_mg_${customMaterialCount}" placeholder="カスタム 苦土 (%)"><br>
            <input type="number" id="custom_material_k_${customMaterialCount}" placeholder="カスタム カリ (%)"><br>
            <input type="number" id="custom_material_ca_${customMaterialCount}" placeholder="カスタム 石灰 (%)"><br>
            <input type="number" id="custom_material_amount_${customMaterialCount}" placeholder="投入量 (kg/10a) ※未入力で自動計算"><br>
            <button onclick="removeCustomMaterial(${customMaterialCount})">削除</button><br><br>
        `;
        container.appendChild(customMaterialDiv);
        console.log(`Added custom material ${customMaterialCount}`);
    } catch (error) {
        console.error("addCustomMaterial エラー:", error);
    }
}

function removeCustomMaterial(id) {
    try {
        console.log(`removeCustomMaterial called for id: ${id}`);
        let customMaterialDiv = document.getElementById(`custom_material_${id}`);
        if (customMaterialDiv) {
            customMaterialDiv.remove();
            console.log(`Removed custom material ${id}`);

            // 残っているカスタム改良材の数をチェック
            let container = document.getElementById("custom_materials_container");
            let remainingMaterials = container.getElementsByTagName("div").length;

            // カスタム改良材が1つも残っていない場合、customMaterialCountをリセット
            if (remainingMaterials === 0) {
                customMaterialCount = 0;
                console.log("All custom materials removed, resetting customMaterialCount to 0");
            }
        }
    } catch (error) {
        console.error("removeCustomMaterial エラー:", error);
    }
}

function calculate() {
    try {
        console.log("calculate() started");

        // 入力値を取得
        let cec = parseFloat(document.getElementById("cec").value);
        let ca = parseFloat(document.getElementById("ca").value);
        let mg = parseFloat(document.getElementById("mg").value);
        let k = parseFloat(document.getElementById("k").value);
        let method = document.getElementById("method").value;
        let bulk_density = parseFloat(document.getElementById("bulk_density").value);
        let depth = parseFloat(document.getElementById("depth").value);

        // 入力値のチェック
        console.log("Input values: ", { cec, ca, mg, k, method, bulk_density, depth });
        if (isNaN(cec) || isNaN(ca) || isNaN(mg) || isNaN(k) || isNaN(bulk_density) || isNaN(depth)) {
            document.getElementById("result").innerHTML = "すべての値を入力してください。";
            console.log("Input validation failed: ", { cec, ca, mg, k, bulk_density, depth });
            return;
        }

        // 現在の塩基飽和度を計算
        let ca_meq = ca / 28.14; // Caのme/100g
        let mg_meq = mg / 20.16; // Mgのme/100g
        let k_meq = k / 47.1;   // Kのme/100g

        let ca_saturation = (ca_meq / cec) * 100;
        let mg_saturation = (mg_meq / cec) * 100;
        let k_saturation = (k_meq / cec) * 100;
        let total_saturation = ca_saturation + mg_saturation + k_saturation;

        console.log("Current saturation: ", { ca_saturation, mg_saturation, k_saturation, total_saturation });

        // 目標飽和度の計算
        let target_ca, target_mg, target_k;
        if (method === "1") {
            target_ca = parseFloat(document.getElementById("target_ca").value);
            target_mg = parseFloat(document.getElementById("target_mg").value);
            target_k = parseFloat(document.getElementById("target_k").value);

            console.log("Method 1 inputs: ", { target_ca, target_mg, target_k });
            if (isNaN(target_ca) || isNaN(target_mg) || isNaN(target_k)) {
                document.getElementById("result").innerHTML = "目標飽和度を入力してください。";
                console.log("Method 1 validation failed: ", { target_ca, target_mg, target_k });
                return;
            }
        } else {
            let total = parseFloat(document.getElementById("total_saturation").value);
            let ratio_ca = parseFloat(document.getElementById("ratio_ca").value);
            let ratio_mg = parseFloat(document.getElementById("ratio_mg").value);
            let ratio_k = 1; // Kは1に固定

            console.log("Method 2 inputs: ", { total, ratio_ca, ratio_mg, ratio_k });
            if (isNaN(total) || isNaN(ratio_ca) || isNaN(ratio_mg)) {
                document.getElementById("result").innerHTML = "全体の塩基飽和度と対比を入力してください。";
                console.log("Method 2 validation failed: ", { total, ratio_ca, ratio_mg });
                return;
            }

            // 対比が正の数であるかチェック
            if (ratio_ca <= 0 || ratio_mg <= 0) {
                document.getElementById("result").innerHTML = "対比は正の数を入力してください。";
                console.log("Ratio validation failed: ", { ratio_ca, ratio_mg });
                return;
            }

            // 対比の合計を計算
            let ratio_sum = ratio_ca + ratio_mg + ratio_k;

            // 各成分の割合（%）を計算
            let ca_percent = (ratio_ca / ratio_sum) * 100;
            let mg_percent = (ratio_mg / ratio_sum) * 100;
            let k_percent = (ratio_k / ratio_sum) * 100;

            // 全体の塩基飽和度を使って目標飽和度を計算
            target_ca = (ca_percent / 100) * total;
            target_mg = (mg_percent / 100) * total;
            target_k = (k_percent / 100) * total;

            console.log("Method 2 calculated targets: ", { target_ca, target_mg, target_k });
        }

        // 過不足の計算
        let target_ca_meq = (target_ca / 100) * cec;
        let target_mg_meq = (target_mg / 100) * cec;
        let target_k_meq = (target_k / 100) * cec;

        let diff_ca_meq = target_ca_meq - ca_meq;
        let diff_mg_meq = target_mg_meq - mg_meq;
        let diff_k_meq = target_k_meq - k_meq;

        let diff_ca_mg = diff_ca_meq * 28.14;
        let diff_mg_mg = diff_mg_meq * 20.16;
        let diff_k_mg = diff_k_meq * 47.1;

        let final_ca_kg = diff_ca_mg * (depth / 10) * bulk_density;
        let final_mg_kg = diff_mg_mg * (depth / 10) * bulk_density;
        let final_k_kg = diff_k_mg * (depth / 10) * bulk_density;

        console.log("Over/Under calculation: ", { final_ca_kg, final_mg_kg, final_k_kg });

        // 過不足の値がマイナスなら赤字で表示
        let ca_display = final_ca_kg < 0 ? `<span class="negative">${final_ca_kg.toFixed(2)}</span>` : final_ca_kg.toFixed(2);
        let mg_display = final_mg_kg < 0 ? `<span class="negative">${final_mg_kg.toFixed(2)}</span>` : final_mg_kg.toFixed(2);
        let k_display = final_k_kg < 0 ? `<span class="negative">${final_k_kg.toFixed(2)}</span>` : final_k_kg.toFixed(2);

        // 結果を表示（注意書きを追加）
        let result = `
            <h2>計算結果</h2>
            <h3>現在の塩基飽和度</h3>
            Ca: ${ca_saturation.toFixed(2)}%<br>
            Mg: ${mg_saturation.toFixed(2)}%<br>
            K: ${k_saturation.toFixed(2)}%<br>
            合計: ${total_saturation.toFixed(2)}%<br>
            <h3>過不足</h3>
            Ca: ${ca_display} kg/10a<br>
            Mg: ${mg_display} kg/10a<br>
            K: ${k_display} kg/10a<br>
            <p class="warning">⚠ マイナスの値は過剰分を示しています</p>
        `;

        // 選択された改良材を取得
        let use_kuto_tankar = document.getElementById("use_kuto_tankar").checked;
        let use_magnesium_hydroxide = document.getElementById("use_magnesium_hydroxide").checked;

        console.log("Selected materials: ", { use_kuto_tankar, use_magnesium_hydroxide });

        // 残りの過不足値を初期化
        let remaining_ca_kg = final_ca_kg;
        let remaining_mg_kg = final_mg_kg;
        let remaining_k_kg = final_k_kg;

        // 改良材ごとの成分比率と結果を格納する配列
        let materials = [];

        // 苦土タンカルの処理
        if (use_kuto_tankar && (remaining_ca_kg > 0 || remaining_mg_kg > 0)) {
            let material_alkali = parseFloat(document.getElementById("kuto_tankar_alkali").value) || 0;
            let material_mg = parseFloat(document.getElementById("kuto_tankar_mg").value) || 0;
            let material_ca = material_alkali - (material_mg * 1.3914);
            material_ca = material_ca / 100; // %を割合に変換
            material_mg = material_mg / 100;
            let user_amount = document.getElementById("kuto_tankar_amount").value;
            let required_material = 0;

            console.log("Kuto Tankar inputs: ", { material_alkali, material_mg, material_ca, user_amount });

            if (user_amount !== "") {
                // ユーザーが投入量を指定した場合
                required_material = parseFloat(user_amount);
                let ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));

                // 過不足を超えないように調整
                if (ca_contribution > remaining_ca_kg && material_ca > 0) {
                    required_material = remaining_ca_kg / material_ca;
                    ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                    mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                }
                if (mg_contribution > remaining_mg_kg && material_mg > 0) {
                    required_material = remaining_mg_kg / material_mg;
                    ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                    mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                }
            } else {
                // 投入量が未入力の場合、自動計算
                let required_by_ca = material_ca > 0 ? remaining_ca_kg / material_ca : 0;
                let required_by_mg = material_mg > 0 ? remaining_mg_kg / material_mg : 0;
                required_material = Math.max(required_by_ca, required_by_mg);

                let ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));

                if (ca_contribution > remaining_ca_kg && material_ca > 0) {
                    required_material = remaining_ca_kg / material_ca;
                    ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                    mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                }
                if (mg_contribution > remaining_mg_kg && material_mg > 0) {
                    required_material = remaining_mg_kg / material_mg;
                    ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                    mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                }
            }

            if (required_material > 0) {
                let ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));

                materials.push({
                    name: "苦土タンカル",
                    amount: required_material,
                    ca_ratio: material_ca,
                    mg_ratio: material_mg,
                    k_ratio: 0
                });

                // 残りの過不足値を更新
                remaining_ca_kg = parseFloat((remaining_ca_kg - ca_contribution).toFixed(2));
                remaining_mg_kg = parseFloat((remaining_mg_kg - mg_contribution).toFixed(2));
            }
            console.log("Kuto Tankar processed: ", { required_material, remaining_ca_kg, remaining_mg_kg });
        }

        // 水酸化マグネシウムの処理
        if (use_magnesium_hydroxide && remaining_mg_kg > 0) {
            let material_mg = parseFloat(document.getElementById("magnesium_hydroxide_mg").value) || 0;
            material_mg = material_mg / 100;
            let user_amount = document.getElementById("magnesium_hydroxide_amount").value;
            let required_material = 0;

            console.log("Magnesium Hydroxide inputs: ", { material_mg, user_amount });

            if (user_amount !== "") {
                // ユーザーが投入量を指定した場合
                required_material = parseFloat(user_amount);
                let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));

                // 過不足を超えないように調整
                if (mg_contribution > remaining_mg_kg) {
                    required_material = remaining_mg_kg / material_mg;
                    mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                }
            } else {
                // 投入量が未入力の場合、自動計算
                let required_by_mg = material_mg > 0 ? remaining_mg_kg / material_mg : 0;
                required_material = required_by_mg;

                let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                if (mg_contribution > remaining_mg_kg) {
                    required_material = remaining_mg_kg / material_mg;
                    mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                }
            }

            if (required_material > 0) {
                let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));

                materials.push({
                    name: "水酸化マグネシウム",
                    amount: required_material,
                    ca_ratio: 0,
                    mg_ratio: material_mg,
                    k_ratio: 0
                });

                // 残りの過不足値を更新
                remaining_mg_kg = parseFloat((remaining_mg_kg - mg_contribution).toFixed(2));
            }
            console.log("Magnesium Hydroxide processed: ", { required_material, remaining_mg_kg });
        }

        // カスタム改良材の処理（動的に追加された分をすべて処理）
        console.log("Processing custom materials, count: ", customMaterialCount);
        for (let i = 1; i <= customMaterialCount; i++) {
            let customMaterialDiv = document.getElementById(`custom_material_${i}`);
            console.log(`Checking custom material ${i}: `, customMaterialDiv);
            if (customMaterialDiv && (remaining_ca_kg > 0 || remaining_mg_kg > 0 || remaining_k_kg > 0)) {
                let material_alkali = parseFloat(document.getElementById(`custom_material_alkali_${i}`).value) || 0;
                let material_mg = parseFloat(document.getElementById(`custom_material_mg_${i}`).value) || 0;
                let material_k = parseFloat(document.getElementById(`custom_material_k_${i}`).value) || 0;
                let material_ca = parseFloat(document.getElementById(`custom_material_ca_${i}`).value) || 0;

                // カスタムの場合、アルカリ分が入力されてたらそれを使う
                if (material_alkali > 0) {
                    material_ca = material_alkali - (material_mg * 1.3914);
                }
                material_ca = material_ca / 100;
                material_mg = material_mg / 100;
                material_k = material_k / 100;

                console.log(`Custom Material ${i} inputs: `, { material_alkali, material_mg, material_k, material_ca });

                // すべての成分が0または未入力の場合、このカスタム改良材をスキップ
                if (material_ca === 0 && material_mg === 0 && material_k === 0) {
                    console.log(`Custom Material ${i} skipped: All components are 0 or not entered`);
                    continue;
                }

                let user_amount = document.getElementById(`custom_material_amount_${i}`).value;
                let required_material = 0;

                console.log(`Custom Material ${i} user amount: `, user_amount);

                if (user_amount !== "") {
                    // ユーザーが投入量を指定した場合
                    required_material = parseFloat(user_amount);
                    let ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                    let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                    let k_contribution = parseFloat((required_material * material_k).toFixed(2));

                    // 過不足を超えないように調整
                    if (ca_contribution > remaining_ca_kg && material_ca > 0) {
                        required_material = remaining_ca_kg / material_ca;
                        ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                        mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                        k_contribution = parseFloat((required_material * material_k).toFixed(2));
                    }
                    if (mg_contribution > remaining_mg_kg && material_mg > 0) {
                        required_material = remaining_mg_kg / material_mg;
                        ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                        mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                        k_contribution = parseFloat((required_material * material_k).toFixed(2));
                    }
                    if (k_contribution > remaining_k_kg && material_k > 0) {
                        required_material = remaining_k_kg / material_k;
                        ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                        mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                        k_contribution = parseFloat((required_material * material_k).toFixed(2));
                    }
                } else {
                    // 投入量が未入力の場合、自動計算
                    let required_by_ca = material_ca > 0 ? remaining_ca_kg / material_ca : 0;
                    let required_by_mg = material_mg > 0 ? remaining_mg_kg / material_mg : 0;
                    let required_by_k = material_k > 0 ? remaining_k_kg / material_k : 0;
                    required_material = Math.max(required_by_ca, required_by_mg, required_by_k);

                    let ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                    let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                    let k_contribution = parseFloat((required_material * material_k).toFixed(2));

                    if (ca_contribution > remaining_ca_kg && material_ca > 0) {
                        required_material = remaining_ca_kg / material_ca;
                        ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                        mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                        k_contribution = parseFloat((required_material * material_k).toFixed(2));
                    }
                    if (mg_contribution > remaining_mg_kg && material_mg > 0) {
                        required_material = remaining_mg_kg / material_mg;
                        ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                        mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                        k_contribution = parseFloat((required_material * material_k).toFixed(2));
                    }
                    if (k_contribution > remaining_k_kg && material_k > 0) {
                        required_material = remaining_k_kg / material_k;
                        ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                        mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                        k_contribution = parseFloat((required_material * material_k).toFixed(2));
                    }
                }

                if (required_material > 0) {
                    let ca_contribution = parseFloat((required_material * material_ca).toFixed(2));
                    let mg_contribution = parseFloat((required_material * material_mg).toFixed(2));
                    let k_contribution = parseFloat((required_material * material_k).toFixed(2));

                    materials.push({
                        name: document.getElementById(`custom_material_name_${i}`).value || `カスタム改良材 ${i}`,
                        amount: required_material,
                        ca_ratio: material_ca,
                        mg_ratio: material_mg,
                        k_ratio: material_k
                    });

                    // 残りの過不足値を更新
                    remaining_ca_kg = parseFloat((remaining_ca_kg - ca_contribution).toFixed(2));
                    remaining_mg_kg = parseFloat((remaining_mg_kg - mg_contribution).toFixed(2));
                    remaining_k_kg = parseFloat((remaining_k_kg - k_contribution).toFixed(2));
                }
                console.log(`Custom Material ${i} processed: `, { required_material, remaining_ca_kg, remaining_mg_kg, remaining_k_kg });
            } else {
                console.log(`Custom Material ${i} not processed: Div not found or no remaining needs`);
            }
        }

        // 結果に改良材の量を追加
        if (materials.length > 0) {
            result += `<h3>必要な改良材の量</h3>`;
            materials.forEach(material => {
                let ca_contribution = parseFloat((material.amount * material.ca_ratio).toFixed(2));
                let mg_contribution = parseFloat((material.amount * material.mg_ratio).toFixed(2));
                let k_contribution = parseFloat((material.amount * material.k_ratio).toFixed(2));

                result += `
                    選択した改良材 (${material.name}): ${material.amount.toFixed(2)} kg/10a<br>
                    成分寄与: Ca ${ca_contribution} kg, 
                    Mg ${mg_contribution} kg, 
                    K ${k_contribution} kg<br>
                `;
            });
        }

        // 残りの過不足値を表示
        result += `
            <h3>残りの過不足</h3>
            Ca: ${remaining_ca_kg.toFixed(2)} kg/10a<br>
            Mg: ${remaining_mg_kg.toFixed(2)} kg/10a<br>
            K: ${remaining_k_kg.toFixed(2)} kg/10a<br>
        `;

        document.getElementById("result").innerHTML = result;
        console.log("calculate() completed");
    } catch (error) {
        console.error("calculate エラー:", error);
        document.getElementById("result").innerHTML = "計算中にエラーが発生しました。入力値を確認してください。";
    }
}