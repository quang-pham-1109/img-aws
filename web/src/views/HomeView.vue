<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useToast } from '@/components/ui/toast/use-toast'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/vue-query'
import { ref } from 'vue'
import { getSignedUrls } from '@/lib/api'

const { toast } = useToast()

const isSignedUrlGet = ref<boolean>(false)
const urls = ref()

const getSignedUrlMutation = useMutation({
  onMutate: getSignedUrls,
  onError: (error) => {
    console.error(error)
  },
  onSuccess: (data) => {
    urls.value = data
    isSignedUrlGet.value = false

    return toast({
      title: 'Success',
      description: 'Signed URL has been generated'
    })
  }
})

const formSchema = toTypedSchema(z.array(z.any({})))

const { handleSubmit } = useForm({
  validationSchema: formSchema
})

const onSubmit = handleSubmit((values) => {
  if (isSignedUrlGet.value) {
    getSignedUrlMutation.mutate(values)
  }
  console.log(values)
})
</script>

<template>
  <main class="flex flex-col gap-4">
    <form class="flex flex-col w-2/3 space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="username">
        <FormItem>
          <FormLabel>Drop Images Here</FormLabel>
          <FormControl>
            <Input type="file" placeholder="shadcn" v-bind="componentField" />
          </FormControl>
        </FormItem>
      </FormField>
      <Button type="submit" class="w-40"> Submit </Button>
    </form>
  </main>
</template>
