<script setup>
import { computed, onMounted, ref } from 'vue';

import { generateOrder, getDishesData, getOrdersData } from '@/service/KitchenService';
import { getIngredientsData, getPurchaseHistoryData } from '@/service/WarehouseServices';

const ingredients = ref([]);
const ordersProcess = ref([]);
const orderHistory = ref([]);
const purchaseHistory = ref([]);
const dishes = ref([]);

const dialogOrderVisible = ref(false);
const selectedOrder = ref({});

const dialogDishVisible = ref(false);
const selectedDish = ref({});

const disabledButtonReload = ref(false);

const totalOrders = computed(() => {
    return ordersProcess.value.length + orderHistory.value.length;
});

const totalCompleted = computed(() => {
    return orderHistory.value.filter((item) => item.status == 'Completed').length;
});

const totalCancelled = computed(() => {
    return orderHistory.value.filter((item) => item.status == 'Canceled').length;
});

const selectOrder = (dish) => {
    dialogOrderVisible.value = true;
    selectedOrder.value = dish;
};

const selectRecipe = (dish) => {
    dialogDishVisible.value = true;
    selectedDish.value = dish;
};

const reloadOrderData = async () => {
    disabledButtonReload.value = true;
    ordersProcess.value = orderHistory.value = [];

    await getOrdersData().then((data) => {
        ordersProcess.value = data.filter((item) => item.status != 'Completed' || item.status != 'Canceled');
        orderHistory.value = data.filter((item) => item.status == 'Completed' || item.status == 'Canceled');
    });

    disabledButtonReload.value = false;
};

const reloadIngredientsData = async () => {
    disabledButtonReload.value = true;
    ingredients.value = [];

    await getIngredientsData().then((data) => (ingredients.value = data));

    disabledButtonReload.value = false;
};

const reloadPurchaseHistoryData = async () => {
    disabledButtonReload.value = true;
    purchaseHistory.value = [];

    await getPurchaseHistoryData().then((data) => (purchaseHistory.value = data));

    disabledButtonReload.value = false;
};

const createOrder = async () => {
    disabledButtonReload.value = true;
    await generateOrder();
    disabledButtonReload.value = false;
};

onMounted(() => {
    reloadOrderData();
    reloadIngredientsData();
    reloadPurchaseHistoryData();

    getDishesData().then((data) => (dishes.value = data));
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Orders</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalOrders }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-3 xl:col-span-2">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">In progress</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ ordersProcess.length }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-cog text-orange-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-3 xl:col-span-2">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Completed</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalCompleted }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-thumbs-up text-green-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-3 xl:col-span-2">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Cancelled</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalCancelled }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-thumbs-down text-red-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="p-8 w-full h-full">
                <Button label="Generate order" class="w-full h-full" :disabled="disabledButtonReload" @click="createOrder()"></Button>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-12 gap-8 pt-6">
        <div class="col-span-6">
            <div class="card">
                <div class="flex justify-between items-center mb-6">
                    <div class="font-semibold text-xl">Orders in process</div>
                    <div>
                        <Button icon="pi pi-refresh" severity="secondary" :disabled="disabledButtonReload" rounded outlined @click="reloadOrderData()" />
                    </div>
                </div>
                <DataTable :value="ordersProcess" :rows="5" :paginator="true" responsiveLayout="scroll">
                    <Column field="id" header="Id" style="width: 45%"></Column>
                    <Column field="status" header="Status">
                        <template #body="slotProps">
                            <span
                                :class="{
                                    'text-red-500': slotProps.data.status == 'Canceled',
                                    'text-orange-500': slotProps.data.status != 'Completed' && slotProps.data.status != 'Canceled',
                                    'text-green-500': slotProps.data.status == 'Completed'
                                }"
                                class="font-bold"
                            >
                                {{ slotProps.data.status }}
                            </span>
                        </template>
                    </Column>
                    <Column field="created_at" header="Created">
                        <template #body="slotProps">
                            {{ slotProps.data.created_at }}
                        </template>
                    </Column>
                    <Column style="width: 15%" header="View">
                        <template #body="slotProps">
                            <Button icon="pi pi-search" type="button" class="p-button-text" @click="selectOrder(slotProps.data)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <div class="col-span-6">
            <div class="card">
                <div class="flex justify-between items-center mb-6">
                    <div class="font-semibold text-xl">Order history</div>
                    <div>
                        <Button icon="pi pi-refresh" severity="secondary" :disabled="disabledButtonReload" rounded outlined @click="reloadOrderData()" />
                    </div>
                </div>
                <DataTable :value="orderHistory" :rows="5" :paginator="true" responsiveLayout="scroll">
                    <Column field="id" header="Id" style="width: 45%"></Column>
                    <Column field="status" header="Status">
                        <template #body="slotProps">
                            <span
                                :class="{
                                    'text-red-500': slotProps.data.status == 'Canceled',
                                    'text-orange-500': slotProps.data.status != 'Completed' && slotProps.data.status != 'Canceled',
                                    'text-green-500': slotProps.data.status == 'Completed'
                                }"
                                class="font-bold"
                            >
                                {{ slotProps.data.status }}
                            </span>
                        </template>
                    </Column>
                    <Column field="created_at" header="Created">
                        <template #body="slotProps">
                            {{ slotProps.data.created_at }}
                        </template>
                    </Column>
                    <Column style="width: 15%" header="View">
                        <template #body="slotProps">
                            <Button icon="pi pi-search" type="button" class="p-button-text" @click="selectOrder(slotProps.data)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog v-model:visible="dialogOrderVisible" header="Order details" :style="{ width: '75vw' }" maximizable modal :contentStyle="{ height: '300px' }">
            <div class="flex justify-between items-center">
                <div class="font-semibold text-xl">Id Order: {{ selectedOrder.id }}</div>
            </div>
            <div class="flex justify-between items-center">
                <div class="font-semibold text-xl">Status: {{ selectedOrder.status }}</div>
            </div>
            <DataTable :value="selectedOrder.items" scrollable scrollHeight="flex" tableStyle="min-width: 50rem">
                <Column field="dish_name" header="Name">
                    <template #body="slotProps">
                        <span class="uppercase">
                            {{ slotProps.data.dish_name }}
                        </span>
                    </template>
                </Column>
                <Column field="quantity" header="Quantity"></Column>
            </DataTable>
        </Dialog>
    </div>
    <div class="grid grid-cols-12 gap-8 pt-6">
        <div class="col-span-12 xl:col-span-2">
            <div class="card">
                <div class="flex justify-between items-center mb-6">
                    <div class="font-semibold text-xl">Ingredients</div>
                    <div>
                        <Button icon="pi pi-refresh" severity="secondary" :disabled="disabledButtonReload" rounded outlined @click="reloadIngredientsData()" />
                    </div>
                </div>
                <DataTable :value="ingredients" :rows="10" :paginator="true" responsiveLayout="scroll">
                    <Column field="name" header="Ingredient" style="width: 75%">
                        <template #body="slotProps">
                            <span class="uppercase">
                                {{ slotProps.data.name }}
                            </span>
                        </template>
                    </Column>

                    <Column field="quantity" header="Quantity">
                        <template #body="slotProps">
                            <span
                                :class="{
                                    'text-red-500': slotProps.data.quantity < 1,
                                    'text-orange-500': slotProps.data.quantity >= 1 && slotProps.data.quantity < 5,
                                    'text-green-500': slotProps.data.quantity >= 5
                                }"
                                class="ml-4 font-bold"
                            >
                                {{ slotProps.data.quantity }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-4">
            <div class="card">
                <div class="flex justify-between items-center mb-6">
                    <div class="font-semibold text-xl">Purchase history</div>
                    <div>
                        <Button icon="pi pi-refresh" severity="secondary" :disabled="disabledButtonReload" rounded outlined @click="reloadPurchaseHistoryData()" />
                    </div>
                </div>
                <DataTable :value="purchaseHistory" stripedRows :rows="10" :paginator="true" responsiveLayout="scroll">
                    <Column field="ingredient_name" header="Ingredient" style="width: 35%">
                        <template #body="slotProps">
                            <span class="uppercase">
                                {{ slotProps.data.ingredient_name }}
                            </span>
                        </template>
                    </Column>
                    <Column field="quantity" header="Quantity"></Column>
                    <Column field="createdAt" header="Created">
                        <template #body="slotProps">
                            {{ slotProps.data.createdAt }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="flex justify-between items-center mb-6">
                    <div class="font-semibold text-xl">Menu</div>
                </div>
                <DataTable :value="dishes" stripedRows>
                    <Column field="name" header="Name"></Column>
                    <Column>
                        <template #body="slotProps">
                            <div class="flex flex-wrap justify-end gap-2">
                                <Button icon="pi pi-search" type="button" class="p-button-text" @click="selectRecipe(slotProps.data)"></Button>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <Dialog v-model:visible="dialogDishVisible" :header="selectedDish.name" :style="{ width: '75vw' }" maximizable modal :contentStyle="{ height: '300px' }">
                <DataTable :value="selectedDish.ingredients" scrollable scrollHeight="flex" tableStyle="min-width: 50rem">
                    <Column field="name" header="Name">
                        <template #body="slotProps">
                            <span class="uppercase">
                                {{ slotProps.data.name }}
                            </span>
                        </template>
                    </Column>
                    <Column field="quantity" header="Quantity"></Column>
                </DataTable>
            </Dialog>
        </div>
    </div>
</template>
