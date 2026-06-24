import { fetchFirefly } from "./client";

export interface RuleTrigger {
  id?: string;
  type: string; // e.g. "description_contains", "description_is"
  value: string;
  order?: number;
  active?: boolean;
}

export interface RuleAction {
  id?: string;
  type: string; // e.g. "set_category", "convert_transfer", "link_to_bill"
  value: string;
  order?: number;
  active?: boolean;
}

export interface Rule {
  id: string;
  title: string;
  description?: string;
  ruleGroupId?: string;
  ruleGroupTitle?: string;
  order?: number;
  trigger: "store-journal" | "update-journal";
  active?: boolean;
  strict?: boolean;
  stopProcessing?: boolean;
  triggers: RuleTrigger[];
  actions: RuleAction[];
}

export interface RuleGroup {
  id: string;
  title: string;
  description?: string;
  order?: number;
  active?: boolean;
}

export async function getRules(): Promise<Rule[]> {
  let page = 1;
  let allRules: Rule[] = [];
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchFirefly("/rules", { page: String(page) }, { cache: "no-store" });
    const rules = (data.data || []).map((r: any) => {
      const attr = r.attributes;
      return {
        id: r.id,
        title: attr.title,
        description: attr.description,
        ruleGroupId: attr.rule_group_id,
        ruleGroupTitle: attr.rule_group_title,
        order: attr.order,
        trigger: attr.trigger,
        active: attr.active,
        strict: attr.strict,
        stopProcessing: attr.stop_processing,
        triggers: (attr.triggers || []).map((t: any) => ({
          id: t.id,
          type: t.type,
          value: t.value,
          order: t.order,
          active: t.active,
        })),
        actions: (attr.actions || []).map((a: any) => ({
          id: a.id,
          type: a.type,
          value: a.value,
          order: a.order,
          active: a.active,
        })),
      };
    });
    allRules = allRules.concat(rules);
    totalPages = data.meta?.pagination?.total_pages || 1;
    page++;
  }

  return allRules;
}

export async function getRule(id: string): Promise<Rule> {
  const data = await fetchFirefly(`/rules/${id}`, {}, { cache: "no-store" });
  const r = data.data;
  const attr = r.attributes;
  return {
    id: r.id,
    title: attr.title,
    description: attr.description,
    ruleGroupId: attr.rule_group_id,
    ruleGroupTitle: attr.rule_group_title,
    order: attr.order,
    trigger: attr.trigger,
    active: attr.active,
    strict: attr.strict,
    stopProcessing: attr.stop_processing,
    triggers: (attr.triggers || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      value: t.value,
      order: t.order,
      active: t.active,
    })),
    actions: (attr.actions || []).map((a: any) => ({
      id: a.id,
      type: a.type,
      value: a.value,
      order: a.order,
      active: a.active,
    })),
  };
}

export async function createRule(payload: Omit<Rule, "id">): Promise<Rule> {
  const data = await fetchFirefly(
    "/rules",
    {},
    {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        rule_group_id: payload.ruleGroupId,
        rule_group_title: payload.ruleGroupTitle,
        order: payload.order,
        trigger: payload.trigger,
        active: payload.active ?? true,
        strict: payload.strict ?? false,
        stop_processing: payload.stopProcessing ?? false,
        triggers: payload.triggers.map(t => ({
          type: t.type,
          value: t.value,
          order: t.order,
          active: t.active ?? true,
        })),
        actions: payload.actions.map(a => ({
          type: a.type,
          value: a.value,
          order: a.order,
          active: a.active ?? true,
        })),
      }),
      cache: "no-store",
    }
  );

  const r = data.data;
  const attr = r.attributes;
  return {
    id: r.id,
    title: attr.title,
    description: attr.description,
    ruleGroupId: attr.rule_group_id,
    ruleGroupTitle: attr.rule_group_title,
    order: attr.order,
    trigger: attr.trigger,
    active: attr.active,
    strict: attr.strict,
    stopProcessing: attr.stop_processing,
    triggers: (attr.triggers || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      value: t.value,
      order: t.order,
      active: t.active,
    })),
    actions: (attr.actions || []).map((a: any) => ({
      id: a.id,
      type: a.type,
      value: a.value,
      order: a.order,
      active: a.active,
    })),
  };
}

export async function updateRule(id: string, payload: Partial<Omit<Rule, "id">>): Promise<Rule> {
  const bodyPayload: Record<string, any> = {};

  if (payload.title !== undefined) bodyPayload.title = payload.title;
  if (payload.description !== undefined) bodyPayload.description = payload.description;
  if (payload.ruleGroupId !== undefined) bodyPayload.rule_group_id = payload.ruleGroupId;
  if (payload.ruleGroupTitle !== undefined) bodyPayload.rule_group_title = payload.ruleGroupTitle;
  if (payload.order !== undefined) bodyPayload.order = payload.order;
  if (payload.trigger !== undefined) bodyPayload.trigger = payload.trigger;
  if (payload.active !== undefined) bodyPayload.active = payload.active;
  if (payload.strict !== undefined) bodyPayload.strict = payload.strict;
  if (payload.stopProcessing !== undefined) bodyPayload.stop_processing = payload.stopProcessing;
  
  if (payload.triggers !== undefined) {
    bodyPayload.triggers = payload.triggers.map(t => ({
      type: t.type,
      value: t.value,
      order: t.order,
      active: t.active ?? true,
    }));
  }

  if (payload.actions !== undefined) {
    bodyPayload.actions = payload.actions.map(a => ({
      type: a.type,
      value: a.value,
      order: a.order,
      active: a.active ?? true,
    }));
  }

  const data = await fetchFirefly(
    `/rules/${id}`,
    {},
    {
      method: "PUT",
      body: JSON.stringify(bodyPayload),
      cache: "no-store",
    }
  );

  const r = data.data;
  const attr = r.attributes;
  return {
    id: r.id,
    title: attr.title,
    description: attr.description,
    ruleGroupId: attr.rule_group_id,
    ruleGroupTitle: attr.rule_group_title,
    order: attr.order,
    trigger: attr.trigger,
    active: attr.active,
    strict: attr.strict,
    stopProcessing: attr.stop_processing,
    triggers: (attr.triggers || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      value: t.value,
      order: t.order,
      active: t.active,
    })),
    actions: (attr.actions || []).map((a: any) => ({
      id: a.id,
      type: a.type,
      value: a.value,
      order: a.order,
      active: a.active,
    })),
  };
}

export async function deleteRule(id: string): Promise<void> {
  await fetchFirefly(
    `/rules/${id}`,
    {},
    {
      method: "DELETE",
      cache: "no-store",
    }
  );
}

export async function getRuleGroups(): Promise<RuleGroup[]> {
  const data = await fetchFirefly("/rule-groups", {}, { cache: "no-store" });
  return (data.data || []).map((rg: any) => ({
    id: rg.id,
    title: rg.attributes.title,
    description: rg.attributes.description,
    order: rg.attributes.order,
    active: rg.attributes.active,
  }));
}

export async function createRuleGroup(title: string, description?: string): Promise<RuleGroup> {
  const data = await fetchFirefly(
    "/rule-groups",
    {},
    {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
      }),
      cache: "no-store",
    }
  );
  const rg = data.data;
  return {
    id: rg.id,
    title: rg.attributes.title,
    description: rg.attributes.description,
    order: rg.attributes.order,
    active: rg.attributes.active,
  };
}

export async function getOrCreateRuleGroup(title: string, description?: string): Promise<string> {
  const groups = await getRuleGroups();
  const match = groups.find(g => g.title.toLowerCase() === title.toLowerCase());
  if (match) {
    return match.id;
  }
  const newGroup = await createRuleGroup(title, description);
  return newGroup.id;
}
